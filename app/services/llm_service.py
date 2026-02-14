import logging
import os
from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from openai import OpenAI
from datetime import datetime

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM interactions using OpenAI GPT"""
    
    def __init__(self, model: str = None, api_key: Optional[str] = None):
        """
        Initialize LLM service with GPT.
        Defaults to OpenAI GPT-4o-mini, but can be configured.
        """
        # Get model from env or use default
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        # Debug: Log if key is found (without showing the actual key)
        if api_key:
            logger.info(f"OpenAI API key found (length: {len(api_key)})")
        else:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            logger.warning("Please set OPENAI_API_KEY in your .env file")
        
        if not api_key:
            self.client = None
        else:
            try:
                # Initialize OpenAI client with api_key
                # httpx 0.27.2+ should support proxies parameter
                self.client = OpenAI(api_key=api_key)
                
                logger.info(f"LLM Service initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                logger.error(f"Error type: {type(e).__name__}, Error details: {str(e)}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                self.client = None
    
    async def get_system_prompt(self, db: Optional[AsyncSession] = None, agent_type: str = "external") -> str:
        """Get system prompt based on agent type."""
        if db:
            from sqlalchemy import select
            from app.models.ai_config import AIConfig
            result = await db.execute(select(AIConfig).where(AIConfig.agent_type == agent_type))
            config = result.scalar_one_or_none()
            if config:
                return config.system_prompt
        
        if agent_type == "internal":
            return self._get_internal_prompt()
        return self._get_external_prompt()

    def _get_internal_prompt(self) -> str:
        """Get system prompt for internal employee assistant."""
        return f"""You are the Leucadia Copilot, the internal AI assistant for Leucadia Wastewater District (LWD).
        
Core Instructions:
1.  **Role & Identity**: You exist to assist LWD employees with internal queries, data retrieval, and operational support.
2.  **Tone**: Professional, concise, efficient, and direct. Avoid marketing fluff.
3.  **Strict Context Adherence**: You MUST ONLY answer questions using the provided "Information about Leucadia" context. DO NOT use your general knowledge or any information about public district services unless it is explicitly mentioned in the provided internal context.
4.  **Audience**: LWD Staff (Engineers, Admin, Field Crews).
5.  **Data Isolation**: You are strictly separated from the public-facing assistant. You do not have access to public records or external customer data unless provided in this specific internal context.
6.  **No Hallucinations**: If you don't know the answer or the information is not in the provided context, state clearly: "I cannot find that information in the available internal documents."
7.  **Date/Time Awareness**: The current date is {datetime.now().strftime('%B %d, %Y')}.

If the user asks about public services like billing, payments, or resident permits and that data is NOT in the provided internal context, politely inform them that you are the internal Copilot and they should check the public district website or the external assistant for public inquiries.
"""

    def _get_external_prompt(self) -> str:
        """Get system prompt for public-facing assistant."""
        return f"""You are Leucadia's AI Assistant, the official virtual representative of Leucadia Wastewater District (LWD).

Core Instructions:
1.  **Role & Identity**: You represent LWD to the public. Always speak using "We", "Us", and "Our".
2.  **Tone**: Speak with warmth, professionalism, and authority. Be helpful and community-focused.
3.  **Strict Context Adherence**: You MUST ONLY answer questions using the provided "Information about Leucadia" context. DO NOT use your general knowledge to answer questions about district policies, rates, or internal operations. 
4.  **Data Isolation**: You do not have access to internal employee documents, technical SOPs, or private district data. You only provide information intended for the public.
5.  **Audience**: Leucadia residents, customers, contractors, and the general public.
6.  **No Hallucinations**: If you don't know the answer or the information is not in the provided context, politely guide the user to contact our office directly.
7.  **Formatting**: Use clear bullet points. Do NOT use Markdown headers. Use **Bold Text** for section titles instead.
8.  **Date/Time Awareness**: The current date is {datetime.now().strftime('%B %d, %Y')}.

If the user asks about internal district operations, technical engineering specs, or employee-only data, respond: "I am authorized to assist with public inquiries only. For internal matters, please contact your department supervisor or use the internal district resources."

When someone asks "Who are you?":
Respond: "I am Leucadia's AI Assistant, here to assist you with questions about our public services and information."
"""
    
    async def generate_response(
        self,
        query: str,
        context_chunks: List[dict],
        system_prompt: Optional[str] = None,
        config: Optional[Any] = None  # Using Any to avoid circular import, expected AIConfig
    ) -> str:
        """
        Generate LLM response using RAG context.
        
        Args:
            query: User's question
            context_chunks: List of dicts with 'text' and optionally 'source' keys
            system_prompt: Optional system prompt. If None, uses external persona by default.
            config: Optional AIConfig object to override model/temperature
        
        Returns:
            Generated response string
        """
        if not self.client:
            return "LLM service is not configured. Please set OPENAI_API_KEY environment variable."
        
        # Build context from chunks (without document names)
        context_text = "\n\n".join([
            chunk.get('text', '')
            for chunk in context_chunks
        ])
        
        if not system_prompt:
            system_prompt = self._get_external_prompt()
        
        # Determine model and temperature from config or defaults
        model = self.model
        temperature = 0.7
        
        if config:
            model = getattr(config, 'model', self.model)
            temperature = getattr(config, 'temperature', 0.7)
        
        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"""Information about Leucadia (from documents and scraped content):
{context_text}

Question: {query}"""
            }
        ]
        
        try:
            # OpenAI 1.12.0 uses chat.completions.create
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return f"Error generating response: {str(e)}"
