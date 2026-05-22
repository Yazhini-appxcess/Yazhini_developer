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
    
    async def get_system_prompt(self, db: AsyncSession, agent_type: str = "external") -> str:
        """Get system prompt based on agent type from database."""
        from sqlalchemy import select
        from app.models.ai_config import AIConfig
        result = await db.execute(select(AIConfig).where(AIConfig.agent_type == agent_type))
        config = result.scalar_one_or_none()
        
        if config:
            return config.system_prompt
            
        return "System prompt not configured. Please contact administrator."

    async def generate_response(
        self,
        query: str,
        context_chunks: List[dict],
        system_prompt: Optional[str] = None,
        config: Optional[Any] = None  # Using Any to avoid circular import, expected AIConfig
    ) -> dict:
        """
        Generate LLM response using RAG context.
        
        Args:
            query: User's question
            context_chunks: List of dicts with 'text' and optionally 'source' keys
            system_prompt: Optional system prompt. If None, uses external persona by default.
            config: Optional AIConfig object to override model/temperature
        
        Returns:
            Dict containing:
                - content: Generated response string
                - usage: Dict with token usage stats (prompt_tokens, completion_tokens, total_tokens)
        """
        if not self.client:
            return {
                "content": "LLM service is not configured. Please set OPENAI_API_KEY environment variable.",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
        
        # Build context from chunks (without document names)
        context_text = "\n\n".join([
            chunk.get('text', '')
            for chunk in context_chunks
        ])
        
        if not system_prompt:
            return {
                "content": "Error: No system prompt provided.",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
        
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
            
            content = response.choices[0].message.content
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
            return {
                "content": content,
                "usage": usage
            }
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return {
                "content": f"Error generating response: {str(e)}",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }

