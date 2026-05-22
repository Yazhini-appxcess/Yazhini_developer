import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, select
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings, get_db
from app.services.llm_service import LLMService

async def verify_prompts():
    db_settings = DBSettings()
    print(f"Connecting to database...")
    
    engine = create_async_engine(db_settings.db_url)
    llm = LLMService()
    
    async with engine.begin() as conn:
        print("Verifying LLM Service Prompt Retrieval...")
        
        # Test Internal Retrieval
        try:
            # We need a session object for the method, but engine.begin() gives a connection.
            # Let's manually fetch using the logic to confirm DB has data first
            result = await conn.execute(text("SELECT system_prompt FROM ai_config WHERE agent_type = 'internal'"))
            internal_prompt = result.scalar()
            
            if internal_prompt and "Leucadia Copilot" in internal_prompt:
                print("✅ Internal Prompt found in DB.")
            else:
                print("❌ Internal Prompt MISSING or INVALID in DB.")

            # Test External Retrieval
            result = await conn.execute(text("SELECT system_prompt FROM ai_config WHERE agent_type = 'external'"))
            external_prompt = result.scalar()
            
            if external_prompt and "Leucadia's AI Assistant" in external_prompt:
                print("✅ External Prompt found in DB.")
            else:
                print("❌ External Prompt MISSING or INVALID in DB.")

        except Exception as e:
            print(f"❌ Error during verification: {e}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_prompts())
