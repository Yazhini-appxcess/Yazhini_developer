"""Bot API router for embeddable chat widget."""
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from sqlalchemy import select
from app.models.document import Document
from app.schema.conversation import BotChatRequest, BotChatResponse, SuggestionsResponse
from app.core.mongodb import mongodb_settings
from app.core.database import get_db
from app.models.conversation import Conversation, Message
from app.services.llm_service import LLMService
from app.services.vector_store import VectorStore
from app.services.embedding_service import EmbeddingService
from app.models.settings import OrganizationSettings
from datetime import datetime
from bson import ObjectId
import tiktoken

router = APIRouter(prefix="/api/bot", tags=["bot"])


def count_tokens(text: str, model: str = "gpt-4o-mini") -> int:
    """Count tokens for a given text and model."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def generate_session_id(request: Request) -> str:
    """Generate or get session ID from request."""
    # Try to get from header or cookie
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        # Generate a simple session ID (in production, use a proper session manager)
        import hashlib
        user_agent = request.headers.get("user-agent", "")
        ip = request.client.host if request.client else "unknown"
        session_id = hashlib.md5(f"{ip}{user_agent}".encode()).hexdigest()[:16]
    return session_id


@router.post("/chat", response_model=BotChatResponse)
async def bot_chat(
    bot_request: BotChatRequest, 
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Chat endpoint for embeddable bot widget.
    This endpoint can be called from external websites.
    Only responds based on uploaded documents, not general knowledge.
    """
    logger.info(f"Incoming chat request: agent_type={bot_request.agent_type}, message='{bot_request.message[:50]}'")
    try:
        db_mongo = mongodb_settings.get_database()
        conversations_collection = db_mongo["conversations"]
        
        # Get or create conversation
        session_id = bot_request.session_id or generate_session_id(http_request)
        
        # Find existing conversation for this session, agent type, AND not ended
        # Handle cases where 'ended' might be missing in older docs
        cursor = conversations_collection.find(
            {
                "session_id": session_id,
                "agent_type": bot_request.agent_type,
                "ended": {"$ne": True}
            }
        ).sort("updated_at", -1).limit(1)
        
        conversations = await cursor.to_list(length=1)
        conversation_doc = conversations[0] if conversations else None
        
        # Add user message
        user_message = Message(
            role="user",
            content=bot_request.message,
            timestamp=datetime.utcnow()
        )
        
        # Generate AI response using LLM service
        llm_service = LLMService()
        vector_store = VectorStore()
        embedding_service = EmbeddingService()
        
        # Check if message is a greeting or casual conversation
        message_lower = bot_request.message.lower().strip()
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'hi there', 'hello there']
        is_greeting = any(greeting in message_lower for greeting in greetings) and len(message_lower.split()) <= 3
        
        if is_greeting:
            # Fetch organization settings for dynamic naming
            result = await db.execute(select(OrganizationSettings).limit(1))
            settings = result.scalar_one_or_none()
            company_name = settings.company_name if settings else "the District"
            widget_name = settings.widget_name if settings else "AI Assistant"

            # Handle greetings without requiring document context
            if bot_request.agent_type == "internal":
                ai_response_text = f"Hello! How can I help you today? 😊"
            else:
                ai_response_text = f"Hello! I'm {widget_name}. How can I help you with our services today? 😊"
            
            # Calculate and log token usage locally
            try:
                prompt_tokens = count_tokens(bot_request.message)
                completion_tokens = count_tokens(ai_response_text)
                total_tokens = prompt_tokens + completion_tokens
                
                usage_collection = db_mongo["token_usage"]
                log_entry = {
                    "session_id": session_id,
                    "agent_type": bot_request.agent_type,
                    "timestamp": datetime.utcnow(),
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "model": "tiktoken-calculated",
                    "source": "bot_chat_local"
                }
                await usage_collection.insert_one(log_entry)
                logger.info(f"Logged local token usage for greeting: {log_entry}")
            except Exception as e:
                logger.error(f"Failed to log local token usage: {e}")
        else:
            original_query = bot_request.message
            context_chunks = []
            
            # Internal Assistant: Check for Zoho CRM / Deals integration
            if bot_request.agent_type == "internal":
                try:
                    message_lower = original_query.lower()
                    if any(kw in message_lower for kw in ["deal", "deals", "zoho", "crm"]):
                        logger.info("Deals-related query detected in internal chat. Fetching Zoho data...")
                        from app.models.zoho_config import ZohoConfig
                        from app.services.zoho_service import ZohoService
                        
                        zoho_result = await db.execute(select(ZohoConfig).where(ZohoConfig.is_active == True).limit(1))
                        zoho_config = zoho_result.scalar_one_or_none()
                        
                        if zoho_config:
                            from app.core.encryption import decrypt_value
                            
                            zoho_svc = ZohoService(
                                client_id=zoho_config.client_id,
                                client_secret=decrypt_value(zoho_config.client_secret),
                                refresh_token=decrypt_value(zoho_config.refresh_token),
                                dc=zoho_config.dc
                            )
                            
                            # Determine if it's a specific search or general fetch
                            deals = []
                            if "search" in message_lower or len(original_query.split()) > 3:
                                # Extract potential deal name (this is naive, improves with NLP)
                                search_term = original_query.replace("deals", "").replace("deal", "").replace("zoho", "").replace("show", "").replace("me", "").strip()
                                if search_term:
                                    logger.info(f"Searching Zoho for: '{search_term}'")
                                    deals = await zoho_svc.search_deals(search_term)
                            
                            if not deals:
                                deals = await zoho_svc.get_recent_deals(limit=5)
                            
                            if deals:
                                deals_text = "Live Zoho Deals Data:\n"
                                for deal in deals:
                                    deal_name = deal.get('Deal_Name', 'Unknown')
                                    amount = deal.get('Amount', 'N/A')
                                    stage = deal.get('Stage', 'N/A')
                                    closing = deal.get('Closing_Date', 'N/A')
                                    deals_text += f"• Deal: {deal_name} | Amount: ${amount} | Stage: {stage} | Closing: {closing}\n"
                                
                                context_chunks.append({
                                    "text": f"LIVE ZOHO CRM DATA:\nThe following are current deals retrieved live from Zoho CRM for your reference:\n\n{deals_text}",
                                    "source": "Zoho CRM (Live API)",
                                    "similarity": 1.0
                                })
                                logger.info(f"Added {len(deals)} deals as live context")
                except Exception as ze:
                    logger.error(f"Error integrating Zoho data: {ze}")
            
            try:
                # Try multiple query variations to improve matching
                query_variations = [original_query]
                
                # Add Leucadia context if not present
                query_lower = original_query.lower()
                if 'leucadia' not in query_lower:
                    query_variations.append(f"{original_query} Leucadia")
                    query_variations.append(f"Leucadia {original_query}")
                
                similar_chunks = []
                best_query = original_query
                
                # Try each query variation with progressively lower thresholds
                for query_variant in query_variations:
                    query_embedding = embedding_service.generate_embedding(query_variant)
                    
                    # Try with multiple thresholds
                    for threshold in [0.2, 0.15, 0.1]:
                        logger.info(f"Searching [{bot_request.agent_type}] with query: '{query_variant}', threshold: {threshold}")
                        chunks = await vector_store.search_similar(
                            db,
                            query_embedding,
                            limit=10,
                            threshold=threshold,
                            agent_type=bot_request.agent_type
                        )
                        
                        if chunks:
                            similar_chunks = chunks
                            best_query = query_variant
                            logger.info(f"Found {len(chunks)} [{bot_request.agent_type}] chunks with query '{query_variant}' at threshold {threshold}")
                            break
                    
                    if similar_chunks:
                        break
                
                # If still no results, try with very low threshold (0.01) ONLY for the requested agent type
                if not similar_chunks:
                    logger.info(f"No results found for {bot_request.agent_type}, trying with very low threshold fallback")
                    fallback_embedding = embedding_service.generate_embedding(query_variations[0])
                    similar_chunks = await vector_store.search_similar(
                        db,
                        fallback_embedding,
                        limit=10,
                        threshold=0.01,
                        agent_type=bot_request.agent_type
                    )

                # Format context chunks and LOG their source type for verification
                if similar_chunks:
                    similar_chunks = similar_chunks[:5]
                    context_chunks = []
                    for chunk, similarity in similar_chunks:
                        # Security check: External assistant must NOT see internal data
                        if bot_request.agent_type == "external" and chunk.agent_type == "internal":
                            logger.error(f"SECURITY BREACH: Found internal chunk in external search!")
                            continue
                        
                        context_chunks.append({
                            "text": chunk.text,
                            "source": f"Document {chunk.document_id}",
                            "similarity": similarity
                        })
                    
                    logger.info(f"Final context has {len(context_chunks)} chunks for {bot_request.agent_type} assistant.")
                else:
                    logger.warning(f"No chunks found for query: '{original_query}'")
                    
            except Exception as e:
                logger.error(f"Could not get document context: {e}", exc_info=True)
            
            # If no context found, return a professional internal assistant message
            if not context_chunks:
                if bot_request.agent_type == "internal":
                    ai_response_text = "I couldn't find specific data related to your query in our internal records or public documentation. Please verify the information you are looking for."
                else:
                    ai_response_text = "I couldn't find specific details regarding your question in our current records. For exact information, please contact our office directly at 760.753.0155."
                
                # Calculate and log token usage locally for fallback
                try:
                    prompt_tokens = count_tokens(original_query)
                    completion_tokens = count_tokens(ai_response_text)
                    total_tokens = prompt_tokens + completion_tokens
                    
                    usage_collection = db_mongo["token_usage"]
                    log_entry = {
                        "session_id": session_id,
                        "agent_type": bot_request.agent_type,
                        "timestamp": datetime.utcnow(),
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "total_tokens": total_tokens,
                        "model": "tiktoken-calculated",
                        "source": "bot_chat_fallback"
                    }
                    await usage_collection.insert_one(log_entry)
                    logger.info(f"Logged local token usage for fallback: {log_entry}")
                except Exception as e:
                    logger.error(f"Failed to log local token usage: {e}")
            else:
                # Get appropriate configuration and system prompt from database
                from app.models.ai_config import AIConfig
                result = await db.execute(select(AIConfig).where(AIConfig.agent_type == bot_request.agent_type))
                config = result.scalar_one_or_none()
                
                # Get system prompt
                logger.info("Fetching system prompt...")
                system_prompt = None
                if config and getattr(config, 'system_prompt', None):
                    system_prompt = config.system_prompt
                else:
                    # Fallback to hardcoded prompts if DB entry missing
                    system_prompt = await llm_service.get_system_prompt(db, agent_type=bot_request.agent_type)
                logger.info(f"System prompt fetched: {len(system_prompt) if system_prompt else 0} chars")

                # Generate response only from the provided context
                logger.info("Generating LLM response...")
                llm_result = await llm_service.generate_response(
                    original_query,
                    context_chunks,
                    system_prompt=system_prompt,
                    config=config
                )
                logger.info("LLM response generated.")
                
                ai_response_text = llm_result["content"]
                token_usage = llm_result["usage"]
                
                # Log token usage
                try:
                    usage_collection = db_mongo["token_usage"]
                    log_entry = {
                        "session_id": session_id,
                        "agent_type": bot_request.agent_type,
                        "timestamp": datetime.utcnow(),
                        "prompt_tokens": token_usage["prompt_tokens"],
                        "completion_tokens": token_usage["completion_tokens"],
                        "total_tokens": token_usage["total_tokens"],
                        "model": getattr(config, 'model', llm_service.model) if config else llm_service.model,
                        "source": "bot_chat"
                    }
                    await usage_collection.insert_one(log_entry)
                    logger.info(f"Logged token usage: {log_entry}")
                except Exception as e:
                    logger.error(f"Failed to log token usage: {e}")
        
        # Add assistant message
        assistant_message = Message(
            role="assistant",
            content=ai_response_text,
            timestamp=datetime.utcnow()
        )
        
        # Log message content length for debugging
        logger.info(f"Saving bot response - content length: {len(ai_response_text)} chars")
        logger.info(f"Full content preview (first 200 chars): {ai_response_text[:200]}")
        logger.info(f"Full content preview (last 200 chars): {ai_response_text[-200:]}")
        
        # Check for bullet points in the response
        has_bullets = any(char in ai_response_text for char in ['•', '-', '*'])
        if has_bullets:
            logger.info(f"Bot response contains bullet points: {ai_response_text.count('•')} bullet chars, {ai_response_text.count('-')} dashes, {ai_response_text.count('*')} asterisks")
        else:
            logger.warning(f"Bot response does NOT contain bullet points! Content preview: {ai_response_text[:300]}")
        
        # Verify content is not truncated before saving
        assistant_dump = assistant_message.model_dump()
        saved_content_length = len(assistant_dump.get("content", ""))
        if saved_content_length != len(ai_response_text):
            logger.error(f"CONTENT TRUNCATION DETECTED! Original: {len(ai_response_text)} chars, Serialized: {saved_content_length} chars")
        else:
            logger.info(f"Content verified - {saved_content_length} chars preserved in model_dump()")
        
        # Update or create conversation
        if conversation_doc:
            # Update existing conversation
            result = await conversations_collection.update_one(
                {
                    "_id": ObjectId(conversation_doc["_id"]),
                    "agent_type": bot_request.agent_type  # Extra safety
                },
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                user_message.model_dump(),
                                assistant_message.model_dump()
                            ]
                        }
                    },
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "website_url": bot_request.website_url or conversation_doc.get("website_url"),
                        "user_ip": bot_request.user_ip or conversation_doc.get("user_ip"),
                        "user_agent": bot_request.user_agent or conversation_doc.get("user_agent"),
                        "user_name": bot_request.user_name or conversation_doc.get("user_name"),
                        "user_email": bot_request.user_email or conversation_doc.get("user_email")
                    }
                }
            )
            logger.info(f"MongoDB update result - matched: {result.matched_count}, modified: {result.modified_count}")
            
            # Verify what was actually saved
            verify_doc = await conversations_collection.find_one({"_id": ObjectId(conversation_doc["_id"])})
            if verify_doc:
                saved_messages = verify_doc.get("messages", [])
                if saved_messages:
                    last_assistant = next((m for m in reversed(saved_messages) if m.get("role") == "assistant"), None)
                    if last_assistant:
                        saved_content = str(last_assistant.get("content", ""))
                        saved_length = len(saved_content)
                        logger.info(f"Verified saved message length: {saved_length} chars (expected: {len(ai_response_text)})")
                        if saved_length != len(ai_response_text):
                            logger.error(f"TRUNCATION IN MONGODB! Expected {len(ai_response_text)} chars, got {saved_length} chars")
                        
                        # Check if bullet points are preserved
                        original_bullets = sum(ai_response_text.count(char) for char in ['•', '-', '*'])
                        saved_bullets = sum(saved_content.count(char) for char in ['•', '-', '*'])
                        if original_bullets != saved_bullets:
                            logger.error(f"BULLET POINTS LOST IN MONGODB! Original had {original_bullets} bullet chars, saved has {saved_bullets} bullet chars")
                        elif original_bullets > 0:
                            logger.info(f"Bullet points preserved: {saved_bullets} bullet characters in saved message")
        else:
            # Create new conversation
            new_conversation = Conversation(
                session_id=session_id,
                agent_type=bot_request.agent_type,
                website_url=bot_request.website_url,
                user_ip=bot_request.user_ip or (http_request.client.host if http_request.client else None),
                user_agent=bot_request.user_agent or http_request.headers.get("user-agent"),
                messages=[user_message, assistant_message],
                user_name=bot_request.user_name,
                user_email=bot_request.user_email,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            await conversations_collection.insert_one(new_conversation.model_dump())
        
        return BotChatResponse(
            response=ai_response_text,
            session_id=session_id
        )
        
    except Exception as e:
        logger.error(f"Error in bot chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.get("/suggestions", response_model=SuggestionsResponse)
async def get_bot_suggestions(
    agent_type: str = "external",
    db: AsyncSession = Depends(get_db)
):
    """
    Generate dynamic suggested questions based on recently uploaded documents.
    """
    try:
        # 1. Get the latest processed document for this agent type
        result = await db.execute(
            select(Document)
            .where(
                Document.processed == True,
                Document.agent_type == agent_type
            )
            .order_by(Document.created_at.desc())
            .limit(1)
        )
        doc = result.scalar_one_or_none()
        
        if agent_type == "internal":
            default_suggestions = [
                "holiday schedule",
                "Vendor payment status",
                "Engineering SOPs",
                "Current district projects"
            ]
        else:
            default_suggestions = [
                "How do I pay my bill?",
                "Apply for a permit",
                "Sewer service rates",
                "Contact district office"
            ]
        
        if not doc or not doc.text_content:
            return SuggestionsResponse(suggestions=default_suggestions)
            
        # 2. Use LLM to generate suggestions based on document snippet
        llm_service = LLMService()
        snippet = doc.text_content[:2000] # Use first 2k chars
        
        prompt = f"""Based on the following document snippet from Leucadia's internal records, 
        generate 4 short, engaging, and professional questions that an employee might ask 
        to learn more or get specific data.
        
        Document Name: {doc.name}
        Snippet: {snippet}
        
        Return ONLY the 4 questions as a simple list, one per line. No numbering, no preamble."""
        
        # We can repurpose generate_response or add a simple completion method
        # For now, let's use a raw completion if possible or just use generate_response with specific query
        llm_result = await llm_service.generate_response(
            query="Generate 4 questions based on the context.",
            context_chunks=[{"text": snippet}],
                system_prompt="You are an assistant that generates short menu-style suggested questions for a chat interface. Output only the questions, one per line."
        )
        suggestions_text = llm_result["content"]
        
        suggestions = [s.strip().strip('-').strip('*').strip() for s in suggestions_text.split('\n') if s.strip()][:4]
        
        # Fallback if LLM fails to provide enough
        if len(suggestions) < 2:
            return SuggestionsResponse(suggestions=default_suggestions)
            
        return SuggestionsResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        return SuggestionsResponse(suggestions=[
            "Summarize document",
            "Check sync status",
            "Export monthly report",
            "View user logs"
        ])


@router.get("/script")
async def get_embed_script(
    type: str = "external",
    db: AsyncSession = Depends(get_db)
):
    """
    Generate embeddable JavaScript code for the bot widget.
    Returns JavaScript code that can be embedded in any website.
    params:
        type: 'internal' or 'external' (default)
    """
    import os
    
    # Fetch branding settings from database
    result = await db.execute(select(OrganizationSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    company_name = settings.company_name if settings else "the District"
    widget_name = settings.widget_name if settings else "AI Assistant"

    api_url = os.getenv("API_URL", "http://localhost:8000")
    
    # Configure widget appearance based on type
    is_internal = type == "internal"
    bot_name = f"{company_name} Copilot" if is_internal else widget_name
    header_color = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" if is_internal else "linear-gradient(135deg, #002c5c 0%, #001a36 100%)"
    
    script = f"""
(function() {{
    // Bot Widget ({type})
    const API_URL = '{api_url}/api/bot';
    const AGENT_TYPE = '{type}';
    
    // Generate session ID
    function getSessionId() {{
        let sessionId = localStorage.getItem('cl_session_id');
        if (!sessionId) {{
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('cl_session_id', sessionId);
        }}
        return sessionId;
    }}
    
    // Create widget HTML
    function createWidget() {{
        const widget = document.createElement('div');
        widget.id = 'cl-bot-widget';
        widget.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div id="cl-bot-container" style="display: none; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); flex-direction: column; position: relative;">
                    <div style="background: {header_color}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="{api_url}/static/LWWD_Logo.jpg" alt="{company_name}" style="width: 24px; height: 24px; object-fit: contain; background: rgba(255,255,255,0.2); border-radius: 4px; padding: 2px;" onerror="this.style.display='none';" />
                            <div>
                                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">{bot_name}</h3>
                                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">How can I help you today?</p>
                            </div>
                        </div>
                        <button id="cl-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; line-height: 1;">×</button>
                    </div>
                    <div id="cl-messages" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; max-width: 85%; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                                ✨ <strong>Welcome to {company_name}!</strong> ✨<br/>
                                How can I assist you today? 🤖💬
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; text-align: right;">08:13 PM</p>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; max-width: 85%; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <p style="margin: 0; font-size: 14px; color: #374151;">Select one option to proceed further!</p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; text-align: right;">08:13 PM</p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; text-align: right;">08:13 PM</p>
                        </div>
                        <div id="cl-options" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
                            <button id="cl-faq-btn" style="background: white; border: 2px solid #002c5c; color: #002c5c; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; text-align: center; transition: all 0.2s;" onmouseover="this.style.background='#002c5c'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#002c5c';">General FAQs</button>
                            <button id="cl-consultation-btn" style="background: white; border: 2px solid #002c5c; color: #002c5c; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; text-align: center; transition: all 0.2s;" onmouseover="this.style.background='#002c5c'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#002c5c';">Book a consultation with us</button>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #e5e7eb; padding: 12px; background: white; border-radius: 0 0 12px 12px;">
                        <div style="display: flex; gap: 8px;">
                            <input id="cl-input" type="text" placeholder="Type your message..." style="flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;" />
                            <button id="cl-send-btn" style="background: #002c5c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">Send</button>
                        </div>
                    </div>
                </div>
                <button id="cl-toggle-btn" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #002c5c 0%, #001a36 100%); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 44, 92, 0.4); display: flex; align-items: center; justify-content: center;">💬</button>
            </div>
        `;
        document.body.appendChild(widget);
        return widget;
    }}
    
    // Initialize widget
    if (!document.getElementById('cl-bot-widget')) {{
        const widget = createWidget();
        const container = document.getElementById('cl-bot-container');
        const toggleBtn = document.getElementById('cl-toggle-btn');
        const closeBtn = document.getElementById('cl-close-btn');
        const sendBtn = document.getElementById('cl-send-btn');
        const input = document.getElementById('cl-input');
        const messagesDiv = document.getElementById('cl-messages');
        const faqBtn = document.getElementById('cl-faq-btn');
        const consultationBtn = document.getElementById('cl-consultation-btn');
        const optionsDiv = document.getElementById('cl-options');
        
        const sessionId = getSessionId();
        const websiteUrl = window.location.href;
        
        // Toggle chat
        toggleBtn.addEventListener('click', () => {{
            container.style.display = container.style.display === 'none' ? 'flex' : 'none';
            toggleBtn.style.display = container.style.display === 'flex' ? 'none' : 'flex';
        }});
        
        closeBtn.addEventListener('click', () => {{
            container.style.display = 'none';
            toggleBtn.style.display = 'flex';
        }});
        
        // Helper function to send message and get response
        async function sendMessageAndGetResponse(messageText) {{
            // Hide options after selection
            if (optionsDiv) optionsDiv.style.display = 'none';
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'background: #002c5c; color: white; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-end;';
            userMsg.innerHTML = `<p style="margin: 0; font-size: 14px;">${{messageText}}</p>`;
            messagesDiv.appendChild(userMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // Show loading indicator
            const loadingMsg = document.createElement('div');
            loadingMsg.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
            loadingMsg.innerHTML = `<p style="margin: 0; font-size: 14px; color: #374151;">Thinking...</p>`;
            messagesDiv.appendChild(loadingMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            try {{
                const response = await fetch(API_URL + '/chat', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        message: messageText,
                        session_id: sessionId,
                        website_url: websiteUrl,
                        user_ip: null,
                        agent_type: AGENT_TYPE,
                        user_agent: navigator.userAgent
                    }})
                }});
                
                const data = await response.json();
                
                // Remove loading message
                loadingMsg.remove();
                
                // Add bot response
                const botMsg = document.createElement('div');
                botMsg.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
                botMsg.innerHTML = `<p style="margin: 0; font-size: 14px; color: #374151;">${{data.response}}</p>`;
                messagesDiv.appendChild(botMsg);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }} catch (error) {{
                console.error('Error sending message:', error);
                loadingMsg.remove();
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'background: #fee2e2; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
                errorMsg.innerHTML = `<p style="margin: 0; font-size: 14px; color: #991b1b;">Sorry, there was an error. Please try again.</p>`;
                messagesDiv.appendChild(errorMsg);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }}
        }}
        
        // FAQ button handler
        faqBtn.addEventListener('click', () => {{
            sendMessageAndGetResponse('General FAQs');
        }});
        
        // Consultation button handler
        consultationBtn.addEventListener('click', () => {{
            sendMessageAndGetResponse('Book a consultation with us');
        }});
        
        // Send message
        async function sendMessage() {{
            const message = input.value.trim();
            if (!message) return;
            
            // Hide options if visible
            if (optionsDiv) optionsDiv.style.display = 'none';
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'background: #002c5c; color: white; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-end;';
            userMsg.innerHTML = `<p style="margin: 0; font-size: 14px;">${{message}}</p>`;
            messagesDiv.appendChild(userMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            input.value = '';
            sendBtn.disabled = true;
            sendBtn.textContent = '...';
            
            try {{
                const response = await fetch(API_URL + '/chat', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        message: message,
                        session_id: sessionId,
                        website_url: websiteUrl,
                        user_ip: null,
                        agent_type: AGENT_TYPE,
                        user_agent: navigator.userAgent
                    }})
                }});
                
                const data = await response.json();
                
                // Add bot response
                const botMsg = document.createElement('div');
                botMsg.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
                botMsg.innerHTML = `<p style="margin: 0; font-size: 14px; color: #374151;">${{data.response}}</p>`;
                messagesDiv.appendChild(botMsg);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }} catch (error) {{
                console.error('Error sending message:', error);
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'background: #fee2e2; padding: 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
                errorMsg.innerHTML = `<p style="margin: 0; font-size: 14px; color: #991b1b;">Sorry, there was an error. Please try again.</p>`;
                messagesDiv.appendChild(errorMsg);
            }} finally {{
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
            }}
        }}
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {{
            if (e.key === 'Enter') sendMessage();
        }});
    }}
}})();
"""
    
    return JSONResponse(
        content={"script": script.strip()},
        headers={"Content-Type": "application/json"}
    )

