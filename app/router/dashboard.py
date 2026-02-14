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
        mongo_filter = {"created_at": {"$gte": today}}
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        today_conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        active_sessions = len(set(conv.get("session_id") for conv in today_conversations if conv.get("session_id")))
        
        # AI queries today (count user messages)
        ai_queries = 0
        for conv in today_conversations:
            messages = conv.get("messages", [])
            user_messages = [msg for msg in messages if msg.get("role") == "user"]
            ai_queries += len(user_messages)
        
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
        mongo_filter_yesterday = {"created_at": {"$gte": yesterday, "$lt": today}}
        if agent_type:
            mongo_filter_yesterday["agent_type"] = agent_type
            
        yesterday_conversations = await conversations_collection.find(mongo_filter_yesterday).to_list(length=None)
        sessions_yesterday = len(set(conv.get("session_id") for conv in yesterday_conversations if conv.get("session_id")))
        
        # Queries yesterday
        queries_yesterday = 0
        for conv in yesterday_conversations:
            messages = conv.get("messages", [])
            user_messages = [msg for msg in messages if msg.get("role") == "user"]
            queries_yesterday += len(user_messages)
        
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
        
        # Total conversations
        mongo_all_filter = {}
        if agent_type:
            mongo_all_filter["agent_type"] = agent_type
            
        all_conversations = await conversations_collection.find(mongo_all_filter).to_list(length=None)
        total_sessions = len(set(conv.get("session_id") for conv in all_conversations if conv.get("session_id")))
        
        # Total AI queries (all user messages)
        total_queries = 0
        for conv in all_conversations:
            messages = conv.get("messages", [])
            user_messages = [msg for msg in messages if msg.get("role") == "user"]
            total_queries += len(user_messages)
        
        return {
            "documents_processed": documents_total,  # Show total instead of today's
            "documents_change": calc_change(documents_processed, documents_yesterday),
            "ai_queries": total_queries,  # Show total instead of today's
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
            start_date = end_date - timedelta(days=7)  # Last 7 days
            date_format = "%a"  # Day name
        elif period == "week":
            start_date = end_date - timedelta(weeks=4)  # Last 4 weeks
            date_format = "Week %U"
        else:  # month
            start_date = end_date - timedelta(days=30)  # Last 30 days
            date_format = "%b %d"
        
        # Get documents by day
        doc_query = select(
            func.date(Document.created_at).label("date"),
            func.count(Document.id).label("count")
        ).where(
            Document.created_at >= start_date
        )
        if agent_type:
            doc_query = doc_query.where(Document.agent_type == agent_type)
            
        doc_query = doc_query.group_by(func.date(Document.created_at)).order_by(func.date(Document.created_at))
        
        result = await db.execute(doc_query)
        documents_by_date = {row.date: row.count for row in result.all()}
        
        # Get conversations
        mongo_filter = {
            "$or": [
                {"created_at": {"$gte": start_date}},
                {"messages.timestamp": {"$gte": start_date}}
            ]
        }
        if agent_type:
            mongo_filter["agent_type"] = agent_type
            
        conversations = await conversations_collection.find(mongo_filter).to_list(length=None)
        
        questions_by_date = {}
        for conv in conversations:
            messages = conv.get("messages", [])
            for msg in messages:
                if msg.get("role") != "user":
                    continue
                
                ts = msg.get("timestamp")
                if not ts:
                    continue
                
                # Handle different date formats from MongoDB
                if isinstance(ts, str):
                    try:
                        ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                    except:
                        continue
                elif not isinstance(ts, datetime):
                    continue
                
                if ts < start_date:
                    continue
                    
                date_key = ts.date()
                questions_by_date[date_key] = questions_by_date.get(date_key, 0) + 1
        
        # Combine and format data
        all_dates = sorted(set(documents_by_date.keys()) | set(questions_by_date.keys()))
        data = []
        
        # Ensure we have a continuous range or at least all active days
        for date in all_dates:
            if period == "day":
                label = date.strftime("%a")
            else:
                label = date.strftime("%b %d")
            
            data.append({
                "day" if period == "day" else "date": label,
                "questions": questions_by_date.get(date, 0),
                "documents": documents_by_date.get(date, 0)
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
        
        # Get conversations
        conversations = await conversations_collection.find({
            "created_at": {"$gte": start_date}
        }).to_list(length=None)
        
        # Get conversations (including those updated in the period)
        mongo_filter = {
            "$or": [
                {"created_at": {"$gte": start_date}},
                {"updated_at": {"$gte": start_date}},
                {"messages.timestamp": {"$gte": start_date}}
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
                    try: return datetime.fromisoformat(dt_val.replace("Z", "+00:00"))
                    except: return None
                return dt_val if isinstance(dt_val, datetime) else None

            # 1. Track conversation starts
            conv_dt = parse_dt(created_at)
            if conv_dt and conv_dt >= start_date:
                key = conv_dt.strftime("%Y-%m-%d") if period == "day" else conv_dt.strftime("%Y-%m")
                conversations_by_period[key] = conversations_by_period.get(key, 0) + 1
                if session_id:
                    if key not in sessions_by_period: sessions_by_period[key] = set()
                    sessions_by_period[key].add(session_id)

            # 2. Track queries by message timestamp
            messages = conv.get("messages", [])
            for msg in messages:
                if msg.get("role") == "user":
                    msg_dt = parse_dt(msg.get("timestamp"))
                    if msg_dt and msg_dt >= start_date:
                        key = msg_dt.strftime("%Y-%m-%d") if period == "day" else msg_dt.strftime("%Y-%m")
                        queries_by_period[key] = queries_by_period.get(key, 0) + 1
                        # If msg exists, session was active
                        if session_id:
                            if key not in sessions_by_period: sessions_by_period[key] = set()
                            sessions_by_period[key].add(session_id)

        # Get form submissions
        if period == "day":
            day_expr = func.date_trunc('day', FormSubmission.created_at)
            result = await db.execute(
                select(
                    func.to_char(day_expr, "YYYY-MM-DD").label("day"),
                    func.count(FormSubmission.id).label("count")
                ).where(FormSubmission.created_at >= start_date).group_by(day_expr)
            )
            for row in result.all():
                submissions_by_period[row.day] = row.count
        else:
            month_expr = func.date_trunc('month', FormSubmission.created_at)
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
        mongo_filter = {}
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
        
        mongo_filter = {}
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
        mongo_filter = {"created_at": {"$gte": start_date}}
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
            ).where(
                FormSubmission.created_at >= start_date
            ).group_by(form_month_expr)
            .order_by(form_month_expr)
        )
        
        for row in result.all():
            submissions_by_month[row.month] = row.count
        
        # Format data
        data = []
        all_months = set(conversations_by_month.keys()) | set(documents_by_month.keys()) | set(submissions_by_month.keys())
        
        for month_key in sorted(all_months):
            month_date = datetime.strptime(month_key, "%Y-%m")
            data.append({
                "month": month_date.strftime("%b"),
                "conversations": conversations_by_month.get(month_key, 0),
                "documents": documents_by_month.get(month_key, 0),
                "submissions": submissions_by_month.get(month_key, 0),
                "sessions": len(sessions_by_month.get(month_key, set()))
            })
        
        return {"data": data}
    except Exception as e:
        logger.error(f"Error getting user activity stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting user activity stats: {str(e)}")

