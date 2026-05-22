import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings
from app.services.llm_service import LLMService

async def verify_llm_service_end_to_end():
    db_settings = DBSettings()
    print(f"Connecting to database...")
    
    engine = create_async_engine(db_settings.db_url)
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    llm = LLMService()
    
    async with AsyncSessionLocal() as session:
        print("Testing LLMService.get_system_prompt()...")
        
        # Test Internal
        try:
            prompt = await llm.get_system_prompt(session, "internal")
            if "Leucadia Copilot" in prompt:
                print("✅ Internal Prompt retrieved successfully via Service.")
            else:
                print(f"❌ Internal Prompt retrieval FAILED. Got: {prompt[:50]}...")
        except Exception as e:
            print(f"❌ Error retrieval Internal: {e}")

        # Test External
        try:
            prompt = await llm.get_system_prompt(session, "external")
            if "Leucadia's AI Assistant" in prompt:
                print("✅ External Prompt retrieved successfully via Service.")
            else:
                print(f"❌ External Prompt retrieval FAILED. Got: {prompt[:50]}...")
        except Exception as e:
            print(f"❌ Error retrieval External: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_llm_service_end_to_end())
