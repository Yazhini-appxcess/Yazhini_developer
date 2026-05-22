import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, select
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings
from app.models.ai_config import AIConfig

async def check_ai_config():
    db_settings = DBSettings()
    print(f"Connecting to database...")
    
    engine = create_async_engine(db_settings.db_url)
    
    async with engine.begin() as conn:
        print("Checking ai_config table...")
        result = await conn.execute(text("SELECT * FROM ai_config"))
        rows = result.fetchall()
        
        if not rows:
            print("No AI Config entries found in database. System is using HARDCODED key prompts.")
        else:
            print(f"Found {len(rows)} AI Config entries:")
            for row in rows:
                print(f" - ID: {row.id}, Agent: {row.agent_type}, Model: {row.model}")
                print(f"   Prompt Preview: {row.system_prompt[:100]}...")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_ai_config())
