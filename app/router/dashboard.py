"""Dashboard statistics API router."""
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from sqlalchemy.orm import selectinload
from loguru import logger
import re

from zoneinfo import ZoneInfo
from app.core.database import get_db
from app.core.mongodb import mongodb_settings
from app.core.settings import Settings
from app.models.document import Document, DocumentChunk
from app.models.form_submission import FormSubmission

_settings = Settings()
LA_TZ = ZoneInfo(_settings.timezone)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def parse_user_agent(user_agent: Optional[str]) -> dict:
    """Parse user agent string to extract device and browser info."""
    if not user_agent:
        return {"device": "Unknown", "browser": "Unknown", "platform": "Unknown"}
    
    device = "Desktop"
    browser = "Unknown"
    platform = "Unknown"
    
    # Detect mobile devices
    mobile_pattern = r"(Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone)"
    if re.search(mobile_pattern, user_agent, re.IGNORECASE):
        if "iPad" in user_agent:
            device = "Tablet"
        elif "Android" in user_agent and "Mobile" not in user_agent:
            device = "Tablet"
        else:
            device = "Mobile"
    
    # Detect browsers
    if "Chrome" in user_agent and "Edg" not in user_agent:
        browser = "Chrome"
    elif "Firefox" in user_agent:
        browser = "Firefox"
    elif "Safari" in user_agent and "Chrome" not in user_agent:
        browser = "Safari"
    elif "Edg" in user_agent:
        browser = "Edge"
    elif "Opera" in user_agent or "OPR" in user_agent:
        browser = "Opera"
    
    # Detect platform
    if "Windows" in user_agent:
        platform = "Windows"
    elif "Mac" in user_agent or "Macintosh" in user_agent:
        platform = "macOS"
    elif "Linux" in user_agent:
        platform = "Linux"
    elif "Android" in user_agent:
        platform = "Android"
    elif "iOS" in user_agent or "iPhone" in user_agent or "iPad" in user_agent:
        platform = "iOS"
    
    return {"device": device, "browser": browser, "platform": platform}


@router.get("/stats/today")
async def get_today_stats(
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get today's activity statistics and total counts."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        # Get today's start in California time, then convert to UTC for DB queries
        now_la = datetime.now(LA_TZ)
        today_la = now_la.replace(hour=0, minute=0, second=0, microsecond=0)
        today = today_la.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        
        # Total documents uploaded (all time)
        doc_query = select(func.count(Document.id))
        if agent_type:
            doc_query = doc_query.where(Document.agent_type == agent_type)
            
        result = await db.execute(doc_query)
        documents_total = result.scalar() or 0
        
        # Documents uploaded today
        doc_today_query = select(func.count(Document.id)).where(Document.created_at >= today)
        if agent_type:
            doc_today_query = doc_today_query.where(Document.agent_type == agent_type)
            
        result = await db.execute(doc_today_query)
        documents_processed = result.scalar() or 0
        
        # Form submissions today
        result = await db.execute(
            select(func.count(FormSubmission.id)).where(
                FormSubmission.created_at >= today
            )
        )
        form_submissions = result.scalar() or 0
        
        # Get conversations from MongoDB
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Active sessions today (unique session_ids)
        mongo_filter = {"created_at": {"$gte": today}, "is_deleted": {"$ne": True}}
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        today_conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        # Filter for sessions with actual user messages
        active_sessions_list = []
        for conv in today_conversations:
            # Check for user messages
            has_user_msg = any(m.get("role") == "user" for m in conv.get("messages", []))
            if has_user_msg and conv.get("session_id"):
                active_sessions_list.append(conv.get("session_id"))
                
        active_sessions = len(set(active_sessions_list))
        
        # AI queries today (this variable name is kept for compatibility but now represents TOTAL queries)
        # We need to iterate over ALL conversations to get the total count
        mongo_all_filter = {"is_deleted": {"$ne": True}}
        if agent_type:
            mongo_all_filter["agent_type"] = agent_type
            
        all_conversations_for_queries = await conversations_collection.find(mongo_all_filter).to_list(length=None)
        
        ai_queries = 0
        for conv in all_conversations_for_queries:
            messages = conv.get("messages", [])
            for msg in messages:
                if msg.get("role") == "user":
                    ai_queries += 1
        
        # Calculate changes from yesterday
        yesterday = today - timedelta(days=1)
        
        # Documents yesterday
        doc_yesterday_query = select(func.count(Document.id)).where(
            and_(
                Document.created_at >= yesterday,
                Document.created_at < today
            )
        )
        if agent_type:
            doc_yesterday_query = doc_yesterday_query.where(Document.agent_type == agent_type)
            
        result = await db.execute(doc_yesterday_query)
        documents_yesterday = result.scalar() or 0
        
        # Form submissions yesterday
        result = await db.execute(
            select(func.count(FormSubmission.id)).where(
                and_(
                    FormSubmission.created_at >= yesterday,
                    FormSubmission.created_at < today
                )
            )
        )
        submissions_yesterday = result.scalar() or 0
        
        # Sessions yesterday
        mongo_filter_yesterday = {"created_at": {"$gte": yesterday, "$lt": today}, "is_deleted": {"$ne": True}}
        if agent_type:
            mongo_filter_yesterday["agent_type"] = agent_type
            
        yesterday_conversations = await conversations_collection.find(mongo_filter_yesterday).to_list(length=None)
        
        # Filter yesterday's sessions
        yesterday_sessions_list = []
        for conv in yesterday_conversations:
            has_user_msg = any(m.get("role") == "user" for m in conv.get("messages", []))
            if has_user_msg and conv.get("session_id"):
                yesterday_sessions_list.append(conv.get("session_id"))
        sessions_yesterday = len(set(yesterday_sessions_list))
        
        # Queries yesterday
        queries_yesterday = 0
        for conv in yesterday_conversations:
            messages = conv.get("messages", [])
            for msg in messages:
                if msg.get("role") == "user":
                    queries_yesterday += 1
        
        # Calculate percentage changes
        def calc_change(current, previous):
            if previous == 0:
                return "+100%" if current > 0 else "0%"
            change = ((current - previous) / previous) * 100
            sign = "+" if change >= 0 else ""
            return f"{sign}{change:.0f}%"
        
        def calc_change_absolute(current, previous):
            change = current - previous
            sign = "+" if change >= 0 else ""
            return f"{sign}{abs(change)}"
        
        # Get total counts for all metrics
        # Total form submissions
        result = await db.execute(select(func.count(FormSubmission.id)))
        form_submissions_total = result.scalar() or 0
        
        # Total conversations (with user messages)
        mongo_all_filter = {"is_deleted": {"$ne": True}}
        if agent_type:
            mongo_all_filter["agent_type"] = agent_type
            
        all_conversations = await conversations_collection.find(mongo_all_filter).to_list(length=None)
        
        total_sessions_list = []
        for conv in all_conversations:
            has_user_msg = any(m.get("role") == "user" for m in conv.get("messages", []))
            if has_user_msg and conv.get("session_id"):
                total_sessions_list.append(conv.get("session_id"))
        total_sessions = len(set(total_sessions_list))
        
        return {
            "documents_processed": documents_total,  # Show total instead of today's
            "documents_change": calc_change(documents_processed, documents_yesterday),
            "ai_queries": ai_queries,  # Show total instead of today's
            "ai_queries_change": calc_change(ai_queries, queries_yesterday),
            "active_sessions": total_sessions,  # Show total instead of today's
            "active_sessions_change": calc_change_absolute(active_sessions, sessions_yesterday),
            "form_submissions": form_submissions_total,  # Show total instead of today's
            "form_submissions_change": calc_change_absolute(form_submissions, submissions_yesterday)
        }
    except Exception as e:
        logger.error(f"Error getting today's stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting today's stats: {str(e)}")


@router.get("/stats/activity")
async def get_activity_stats(
    period: str = Query("week", regex="^(day|week|month)$"),
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get activity statistics (questions vs documents) over time."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Determine date range
        # Use California current time as reference
        end_date = datetime.now(LA_TZ).astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        if period == "day":
            start_date = end_date - timedelta(days=6)  # Last 7 days including today
            date_format = "%a"  # Day name
        elif period == "week":
            start_date = end_date - timedelta(weeks=4)  # Last 4 weeks
            date_format = "Week %U"
        else:  # month
            start_date = end_date - timedelta(days=30)  # Last 30 days
            date_format = "%b %d"
            
        # Ensure start_date is at midnight to capture full days
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get documents by day - convert to LA time in SQL
        # Convert UTC to LA time before extracting the date
        la_date_expr = func.date(func.timezone(_settings.timezone, func.timezone('UTC', Document.created_at)))
        doc_query = select(
            la_date_expr.label("date"),
            func.count(Document.id).label("count")
        ).where(
            Document.created_at >= start_date
        )
        if agent_type:
            doc_query = doc_query.where(Document.agent_type == agent_type)
            
        doc_query = doc_query.group_by(la_date_expr).order_by(la_date_expr)
        
        result = await db.execute(doc_query)
        documents_by_date = {row.date: row.count for row in result.all()}
        
        # Get conversations
        mongo_filter = {
            "$or": [
                {"created_at": {"$gte": start_date}, "is_deleted": {"$ne": True}},
                {"messages.timestamp": {"$gte": start_date}, "is_deleted": {"$ne": True}}
            ]
        }
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        # Helper to parse date (same as in visitor_stats)
        def parse_dt(dt_val):
            if not dt_val: return None
            if isinstance(dt_val, str):
                try: 
                    dt = datetime.fromisoformat(dt_val.replace("Z", "+00:00"))
                    return dt.replace(tzinfo=None) # Make naive for comparison
                except: return None
            if isinstance(dt_val, datetime):
                return dt_val.replace(tzinfo=None) # Make naive for comparison
            return None

        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        questions_by_date = {}
        for conv in conversations:
            # Use conversation creation time
            created_at = conv.get("created_at")
            conv_dt_utc = parse_dt(created_at)
            
            if not conv_dt_utc:
                continue
            
            # Convert to LA time for grouping
            conv_dt_la = conv_dt_utc.replace(tzinfo=ZoneInfo("UTC")).astimezone(LA_TZ)
            
            # Double check against start_date (which is UTC naive)
            if conv_dt_utc < start_date:
                continue
                
            if period == "week":
                # Group by week for 'week' period
                date_key = conv_dt_la.strftime("Week %U")
            else: 
                date_key = conv_dt_la.date()
            
            # Count conversations - ONLY if they have user messages
            messages = conv.get("messages", [])
            has_user_message = False
            for msg in messages:
                if msg.get("role") == "user":
                    has_user_message = True
                    break
            
            if not has_user_message:
                continue
                
            questions_by_date[date_key] = questions_by_date.get(date_key, 0) + 1
            
            # Count queries for this date
            # We count all user messages in this conversation for this date bucket
            # Ideally we should bucket messages by their own timestamp, but for "activity"
            # often it's "activity started/happened on date X"
            # However, for accurate daily query counts, we should iterate messages.
        
        # Re-iterate or do it above properly?
        # Let's do a separate pass for queries to be accurate by message timestamp
        queries_by_date = {}
        for conv in conversations:
             messages = conv.get("messages", [])
             for msg in messages:
                if msg.get("role") == "user":
                    msg_dt_utc = parse_dt(msg.get("timestamp"))
                    
                    # Fallback to updated_at or created_at if message timestamp is missing
                    if not msg_dt_utc:
                        msg_dt_utc = parse_dt(conv.get("updated_at"))
                    if not msg_dt_utc:
                        msg_dt_utc = parse_dt(conv.get("created_at"))
                        
                    if msg_dt_utc and msg_dt_utc >= start_date:
                        # Convert to LA time for grouping
                        msg_dt_la = msg_dt_utc.replace(tzinfo=ZoneInfo("UTC")).astimezone(LA_TZ)
                        
                        if period == "week":
                            date_key = msg_dt_la.strftime("Week %U")
                        else: 
                            date_key = msg_dt_la.date()
                            
                        queries_by_date[date_key] = queries_by_date.get(date_key, 0) + 1

        
        # Combine and format data
        # Note: keys in all_dates can be dates (for day/month) or strings (for week)
        # We need to handle sorting carefully
        all_dates = sorted(list(set(documents_by_date.keys()) | set(questions_by_date.keys()) | set(queries_by_date.keys())), key=lambda x: str(x))
        data = []
        
        for date_key in all_dates:
            if isinstance(date_key, str):
                # It's a week string or pre-formatted date
                label = date_key
            elif period == "day":
                label = date_key.strftime("%a")
            else:
                label = date_key.strftime("%b %d")
            
            data.append({
                "day" if period == "day" else "date": label,
                "conversations": questions_by_date.get(date_key, 0),
                "queries": queries_by_date.get(date_key, 0),
                "documents": documents_by_date.get(date_key, 0)
            })
        
        return {"data": data}
    except Exception as e:
        logger.error(f"Error getting activity stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting activity stats: {str(e)}")


@router.get("/stats/visitors")
async def get_visitor_stats(
    period: str = Query("month", regex="^(day|week|month|year)$"),
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get visitor insights over time."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Determine date range
        # Use California current time as reference
        end_date = datetime.now(LA_TZ).astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        if period == "day":
            start_date = end_date - timedelta(days=30)  # Last 30 days
        elif period == "week":
            start_date = end_date - timedelta(weeks=8)
        elif period == "month":
            start_date = end_date - timedelta(days=180)  # 6 months
        else:  # year
            start_date = end_date - timedelta(days=365)
            
        # Ensure start_date is at midnight to capture full days
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get conversations
        conversations = await conversations_collection.find({
            "created_at": {"$gte": start_date}
        }).to_list(length=None)
        
        # Get conversations (including those updated in the period)
        mongo_filter = {
            "$or": [
                {"created_at": {"$gte": start_date}, "is_deleted": {"$ne": True}},
                {"updated_at": {"$gte": start_date}, "is_deleted": {"$ne": True}},
                {"messages.timestamp": {"$gte": start_date}, "is_deleted": {"$ne": True}}
            ]
        }
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        # Aggregation maps
        conversations_by_period = {}
        sessions_by_period = {}
        queries_by_period = {}
        submissions_by_period = {}
        
        # Process conversations and messages
        for conv in conversations:
            created_at = conv.get("created_at")
            session_id = conv.get("session_id")
            
            # Helper to parse date
            def parse_dt(dt_val):
                if not dt_val: return None
                if isinstance(dt_val, str):
                    try: 
                        dt = datetime.fromisoformat(dt_val.replace("Z", "+00:00"))
                        return dt.replace(tzinfo=None) # Make naive for comparison
                    except: return None
                if isinstance(dt_val, datetime):
                    return dt_val.replace(tzinfo=None) # Make naive for comparison
                return None

            # 1. Track conversation starts - ONLY if they contain user messages
            messages = conv.get("messages", [])
            has_user_message = False
            for msg in messages:
                if msg.get("role") == "user":
                    has_user_message = True
                    break
            
            if not has_user_message:
                continue

            conv_dt_utc = parse_dt(created_at)
            if conv_dt_utc and conv_dt_utc >= start_date:
                # Convert to LA time for grouping
                conv_dt_la = conv_dt_utc.replace(tzinfo=ZoneInfo("UTC")).astimezone(LA_TZ)
                key = conv_dt_la.strftime("%Y-%m-%d") if period == "day" else conv_dt_la.strftime("%Y-%m")
                conversations_by_period[key] = conversations_by_period.get(key, 0) + 1
                if session_id:
                    if key not in sessions_by_period: sessions_by_period[key] = set()
                    sessions_by_period[key].add(session_id)

            # 2. Track queries by message timestamp
            # messages list is already retrieved above
            for msg in messages:
                if msg.get("role") == "user":
                    msg_dt_utc = parse_dt(msg.get("timestamp"))
                    
                    # Fallback to updated_at or created_at if message timestamp is missing
                    if not msg_dt_utc:
                        msg_dt_utc = parse_dt(conv.get("updated_at"))
                    if not msg_dt_utc:
                        msg_dt_utc = parse_dt(conv.get("created_at"))
                        
                    if msg_dt_utc and msg_dt_utc >= start_date:
                        # Convert to LA time for grouping
                        msg_dt_la = msg_dt_utc.replace(tzinfo=ZoneInfo("UTC")).astimezone(LA_TZ)
                        key = msg_dt_la.strftime("%Y-%m-%d") if period == "day" else msg_dt_la.strftime("%Y-%m")
                        queries_by_period[key] = queries_by_period.get(key, 0) + 1
                        # If msg exists, session was active
                        if session_id:
                            if key not in sessions_by_period: sessions_by_period[key] = set()
                            sessions_by_period[key].add(session_id)

        # Get form submissions - convert to LA time in SQL
        if period == "day":
            # Convert UTC to LA time before truncating and grouping
            day_expr = func.date_trunc('day', func.timezone(_settings.timezone, func.timezone('UTC', FormSubmission.created_at)))
            result = await db.execute(
                select(
                    func.to_char(day_expr, "YYYY-MM-DD").label("day"),
                    func.count(FormSubmission.id).label("count")
                ).where(FormSubmission.created_at >= start_date).group_by(day_expr)
            )
            for row in result.all():
                submissions_by_period[row.day] = row.count
        else:
            # Convert UTC to LA time before truncating and grouping
            month_expr = func.date_trunc('month', func.timezone(_settings.timezone, func.timezone('UTC', FormSubmission.created_at)))
            result = await db.execute(
                select(
                    func.to_char(month_expr, "YYYY-MM").label("month"),
                    func.count(FormSubmission.id).label("count")
                ).where(FormSubmission.created_at >= start_date).group_by(month_expr)
            )
            for row in result.all():
                submissions_by_period[row.month] = row.count

        # Combine all keys
        all_keys = sorted(set(conversations_by_period.keys()) | 
                         set(sessions_by_period.keys()) | 
                         set(queries_by_period.keys()) | 
                         set(submissions_by_period.keys()))
        
        data = []
        for key in all_keys:
            if period == "day":
                dt = datetime.strptime(key, "%Y-%m-%d")
                label = dt.strftime("%b %d")
            else:
                dt = datetime.strptime(key, "%Y-%m")
                label = dt.strftime("%b")
                
            data.append({
                "day" if period == "day" else "month": label,
                "conversations": conversations_by_period.get(key, 0),
                "sessions": len(sessions_by_period.get(key, set())),
                "queries": queries_by_period.get(key, 0),
                "submissions": submissions_by_period.get(key, 0)
            })
        
        return {"data": data}
    except Exception as e:
        logger.error(f"Error getting visitor stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting visitor stats: {str(e)}")


@router.get("/stats/top-documents")
async def get_top_documents(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get top documents by usage (most chunks used in queries)."""
    try:
        # For now, return documents by chunk count (as proxy for usage)
        # In future, could track actual query usage
        result = await db.execute(
            select(
                Document.id,
                Document.name,
                Document.created_at,
                func.count(DocumentChunk.id).label("chunk_count")
            ).join(
                DocumentChunk, Document.id == DocumentChunk.document_id
            ).group_by(Document.id)
            .order_by(func.count(DocumentChunk.id).desc())
            .limit(limit)
        )
        
        documents = []
        for row in result.all():
            documents.append({
                "id": row.id,
                "name": row.name,
                "chunk_count": row.chunk_count,
                "created_at": row.created_at.isoformat()
            })
        
        return {"data": documents}
    except Exception as e:
        logger.error(f"Error getting top documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting top documents: {str(e)}")


@router.get("/stats/document-importance")
async def get_document_importance(
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Get document importance metrics based on actual usage in queries."""
    try:
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Get all conversations and count document usage from query sources
        conversations = await conversations_collection.find({}).to_list(length=None)
        
        # Track document usage - count how many times each document appears in query results
        document_usage = {}  # {document_id: count}
        
        for conv in conversations:
            messages = conv.get("messages", [])
            for msg in messages:
                # Check if this is an assistant message that might have sources
                if msg.get("role") == "assistant":
                    # Look for document references in the message or metadata
                    # For now, we'll track based on chunk usage patterns
                    # In future, we can store document_ids in message metadata
                    pass
        
        # Get all documents with their chunk counts
        result = await db.execute(
            select(
                Document.id,
                Document.name,
                Document.file_size,
                Document.created_at,
                func.coalesce(func.count(DocumentChunk.id), 0).label("chunk_count")
            ).outerjoin(
                DocumentChunk, Document.id == DocumentChunk.document_id
            ).group_by(Document.id)
        )
        
        documents = []
        max_chunks = 0
        
        # First pass: collect data and find max values
        rows = result.all()
        for row in rows:
            chunk_count = row.chunk_count or 0
            max_chunks = max(max_chunks, chunk_count)
        
        # Second pass: calculate importance scores based on chunk count
        # Documents with more chunks are more likely to be used in queries
        # This is a proxy for actual usage until we implement query tracking
        for row in rows:
            chunk_count = row.chunk_count or 0
            
            # Calculate importance score (0-100) based on chunk count
            # More chunks = more content = higher likelihood of being queried
            importance_score = (chunk_count / max_chunks * 100) if max_chunks > 0 else 0
            importance_score = min(100, round(importance_score, 1))
            
            # Get usage count if available (for future enhancement)
            usage_count = document_usage.get(row.id, 0)
            
            documents.append({
                "id": row.id,
                "name": row.name,
                "chunk_count": chunk_count,
                "file_size": row.file_size or 0,
                "usage_count": usage_count,
                "importance_score": importance_score,
                "created_at": row.created_at.isoformat() if row.created_at else None
            })
        
        # Sort by importance score
        documents.sort(key=lambda x: x["importance_score"], reverse=True)
        
        return {"data": documents[:limit]}
    except Exception as e:
        logger.error(f"Error getting document importance: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting document importance: {str(e)}")


@router.get("/stats/top-websites")
async def get_top_websites(
    limit: int = Query(10, ge=1, le=50),
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get top websites by conversation count."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Aggregate conversations by website_url
        mongo_filter = {"is_deleted": {"$ne": True}}
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        website_stats = {}
        for conv in conversations:
            website_url = conv.get("website_url") or "Unknown"
            if website_url not in website_stats:
                website_stats[website_url] = {
                    "conversations": 0,
                    "sessions": set(),
                    "submissions": 0
                }
            
            website_stats[website_url]["conversations"] += 1
            session_id = conv.get("session_id")
            if session_id:
                website_stats[website_url]["sessions"].add(session_id)
        
        # Get form submissions by website
        result = await db.execute(
            select(
                FormSubmission.website_url,
                func.count(FormSubmission.id).label("count")
            ).group_by(FormSubmission.website_url)
        )
        
        for row in result.all():
            website_url = row.website_url or "Unknown"
            if website_url in website_stats:
                website_stats[website_url]["submissions"] = row.count
        
        # Format and sort
        websites = []
        for website_url, stats in website_stats.items():
            websites.append({
                "website_url": website_url,
                "conversations": stats["conversations"],
                "sessions": len(stats["sessions"]),
                "submissions": stats["submissions"]
            })
        
        websites.sort(key=lambda x: x["conversations"], reverse=True)
        return {"data": websites[:limit]}
    except Exception as e:
        logger.error(f"Error getting top websites: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting top websites: {str(e)}")


@router.get("/stats/devices")
async def get_device_stats(
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get device and browser statistics."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        mongo_filter = {"is_deleted": {"$ne": True}}
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        device_counts = {}
        browser_counts = {}
        platform_counts = {}
        total = 0
        
        for conv in conversations:
            user_agent = conv.get("user_agent")
            parsed = parse_user_agent(user_agent)
            
            device = parsed["device"]
            browser = parsed["browser"]
            platform = parsed["platform"]
            
            device_counts[device] = device_counts.get(device, 0) + 1
            browser_counts[browser] = browser_counts.get(browser, 0) + 1
            platform_counts[platform] = platform_counts.get(platform, 0) + 1
            total += 1
        
        # Format device data
        device_data = []
        for device, count in device_counts.items():
            device_data.append({
                "device": device,
                "count": count,
                "percentage": round((count / total * 100) if total > 0 else 0, 1)
            })
        device_data.sort(key=lambda x: x["count"], reverse=True)
        
        # Format browser data
        browser_data = []
        for browser, count in browser_counts.items():
            browser_data.append({
                "browser": browser,
                "count": count,
                "percentage": round((count / total * 100) if total > 0 else 0, 1)
            })
        browser_data.sort(key=lambda x: x["count"], reverse=True)
        
        return {
            "devices": device_data,
            "browsers": browser_data,
            "total": total
        }
    except Exception as e:
        logger.error(f"Error getting device stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting device stats: {str(e)}")


@router.get("/stats/user-activity")
async def get_user_activity_stats(
    period: str = Query("month", regex="^(week|month|year)$"),
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get user activity statistics over time."""
    try:
        # Normalize agent_type
        if agent_type == "all":
            agent_type = None
            
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Determine date range
        # Use California current time as reference
        end_date = datetime.now(LA_TZ).astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        if period == "week":
            start_date = end_date - timedelta(weeks=8)
        elif period == "month":
            start_date = end_date - timedelta(days=180)  # 6 months
        else:  # year
            start_date = end_date - timedelta(days=365)
        
        # Get conversations
        mongo_filter = {"created_at": {"$gte": start_date}, "is_deleted": {"$ne": True}}
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        # Aggregate by month
        conversations_by_month = {}
        documents_by_month = {}
        submissions_by_month = {}
        sessions_by_month = {}
        
        for conv in conversations:
            created_at = conv.get("created_at")
            if not created_at:
                continue
            
            # Handle different date formats from MongoDB
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    continue
            elif not isinstance(created_at, datetime):
                continue
            
            month_key = created_at.strftime("%Y-%m")
            session_id = conv.get("session_id")
            
            if month_key not in conversations_by_month:
                conversations_by_month[month_key] = 0
                sessions_by_month[month_key] = set()
            
            conversations_by_month[month_key] += 1
            if session_id:
                sessions_by_month[month_key].add(session_id)
        
        # Get documents by month
        doc_query = select(
            func.to_char(doc_month_expr, "YYYY-MM").label("month"),
            func.count(Document.id).label("count")
        ).where(
            Document.created_at >= start_date
        )
        if agent_type:
            doc_query = doc_query.where(Document.agent_type == agent_type)
            
        doc_query = doc_query.group_by(doc_month_expr).order_by(doc_month_expr)
        
        result = await db.execute(doc_query)
        
        for row in result.all():
            documents_by_month[row.month] = row.count
        
        # Get form submissions by month
        # Use date_trunc for proper month grouping in PostgreSQL
        form_month_expr = func.date_trunc('month', FormSubmission.created_at)
        result = await db.execute(
            select(
                func.to_char(form_month_expr, "YYYY-MM").label("month"),
                func.count(FormSubmission.id).label("count")
            ).where(FormSubmission.created_at >= start_date).group_by(form_month_expr)
        )
        for row in result.all():
            submissions_by_month[row.month] = row.count
        
        # Combine all months
        all_months = sorted(set(conversations_by_month.keys()) | 
                           set(documents_by_month.keys()) | 
                           set(submissions_by_month.keys()))
        
        data = []
        for month in all_months:
            dt = datetime.strptime(month, "%Y-%m")
            label = dt.strftime("%b")
            
            data.append({
                "month": label,
                "conversations": conversations_by_month.get(month, 0),
                "sessions": len(sessions_by_month.get(month, set())),
                "documents": documents_by_month.get(month, 0),
                "submissions": submissions_by_month.get(month, 0)
            })
        
        return {"data": data}
    except Exception as e:
        logger.error(f"Error getting user activity stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting user activity stats: {str(e)}")


@router.get("/stats/locations")
async def get_traffic_by_location(
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get traffic by location (mocked for now as we don't have GeoIP)."""
    try:
        # In a real app, we would use a GeoIP library to map user_ip to Location
        # For now, we'll return a static distribution that represents the local district
        # But modify slightly based on agent type just to show we "filtered"
        
        # Leucadia/Encinitas area distribution
        data = [
            {"name": "Encinitas", "value": 45.0, "color": "#1f2937"},
            {"name": "Carlsbad", "value": 25.0, "color": "#60a5fa"}, 
            {"name": "Solana Beach", "value": 20.0, "color": "#10b981"},
            {"name": "Other", "value": 10.0, "color": "#d1d5db"},
        ]
        
        return {"data": data}
    except Exception as e:
        logger.error(f"Error getting locations: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting locations: {str(e)}")


@router.get("/stats/token-usage")
async def get_token_usage_stats(
    period: str = Query("week", regex="^(day|week|month|year)$"),
    agent_type: Optional[str] = Query(None, regex="^(all|internal|external)$"),
):
    """Get token usage statistics over time."""
    try:
        if agent_type == "all":
            agent_type = None

        db_mongo = mongodb_settings.get_database()
        usage_collection = db_mongo["token_usage"]

        # Determine date range (same logic as activity stats)
        # Ensure LA_TZ is available (it should be if other endpoints use it)
        # If LA_TZ is not imported, we use UTC for now or rely on file context
        # Assuming LA_TZ is available as it's used in get_activity_stats
        
        now = datetime.now(ZoneInfo("America/Los_Angeles")) # explicit timezone to be safe if LA_TZ global isn't found
        end_date = now.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        
        if period == "day":
            start_date = end_date - timedelta(days=9) # Last 10 days
            date_format = "%a" # Mon, Tue
        elif period == "week":
            start_date = end_date - timedelta(weeks=4)
            date_format = "%b %d" # Week starts
        elif period == "month":
            start_date = end_date - timedelta(days=365) # Last 12 months
            date_format = "%b %Y" # Jan 2024
        else: # year
            start_date = end_date - timedelta(days=365)
            date_format = "%Y"

        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

        # Build pipeline
        match_stage = {"timestamp": {"$gte": start_date}}
        if agent_type:
            match_stage["agent_type"] = agent_type

        # Adjust grouping format based on period
        mongo_format = "%Y-%m-%d"
        if period == "month":
            mongo_format = "%Y-%m"
        elif period == "year":
            mongo_format = "%Y"
            
        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": mongo_format, 
                            "date": "$timestamp"
                        }
                    },
                    "prompt_tokens": {"$sum": "$prompt_tokens"},
                    "completion_tokens": {"$sum": "$completion_tokens"},
                    "total_tokens": {"$sum": "$total_tokens"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]

        results = await usage_collection.aggregate(pipeline).to_list(length=None)
        results_map = {r["_id"]: r for r in results}
        
        labels = []
        prompt_data = []
        completion_data = []
        total_data = []
        
        # Iterate to fill gaps
        iter_date = start_date
        while iter_date <= end_date:
            if period == "day":
                key = iter_date.strftime("%Y-%m-%d")
                step = timedelta(days=1)
                label = iter_date.strftime("%b %d")
            elif period == "week":
                key = iter_date.strftime("%Y-%m-%d")
                step = timedelta(days=1)
                label = iter_date.strftime("%b %d")
            elif period == "month":
                key = iter_date.strftime("%Y-%m")
                # Increment by roughly a month
                next_month = iter_date.replace(day=28) + timedelta(days=4)
                step = next_month.replace(day=1) - iter_date
                label = iter_date.strftime("%b")
            else:
                key = iter_date.strftime("%Y")
                step = timedelta(days=365)
                label = iter_date.strftime("%Y")
                
            item = results_map.get(key, {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
            
            labels.append(label)
            prompt_data.append(item["prompt_tokens"])
            completion_data.append(item["completion_tokens"])
            total_data.append(item["total_tokens"])
            
            iter_date += step
            
        # Calculate estimated cost (GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output)
        PRICE_PER_M_INPUT = 0.15
        PRICE_PER_M_OUTPUT = 0.60
        
        total_prompt = sum(prompt_data)
        total_completion = sum(completion_data)
        
        estimated_cost = (total_prompt / 1_000_000 * PRICE_PER_M_INPUT) + (total_completion / 1_000_000 * PRICE_PER_M_OUTPUT)

        return {
            "labels": labels,
            "datasets": [
                {"name": "Prompt Tokens", "data": prompt_data, "color": "indigo"},
                {"name": "Completion Tokens", "data": completion_data, "color": "emerald"},
            ],
            "total_usage": sum(total_data),
            "estimated_cost": round(estimated_cost, 6)
        }

    except Exception as e:
        logger.error(f"Error getting token usage stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")
