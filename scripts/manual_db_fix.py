import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings

async def manual_fix():
    db_settings = DBSettings()
    print(f"Connecting to database: {db_settings.db_url}")
    
    engine = create_async_engine(db_settings.db_url)
    
    async with engine.begin() as conn:
        print("Attempting to add column manually...")
        try:
            await conn.execute(text("ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS show_microsoft_hub BOOLEAN DEFAULT TRUE"))
            print("✅ Column added successfully.")
        except Exception as e:
            print(f"❌ Error adding column: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(manual_fix())
