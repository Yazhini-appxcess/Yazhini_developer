import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings

async def add_column():
    settings = DBSettings()
    # Construct DB URL manually if needed, but DBSettings has a property
    # However, DBSettings is a class in the file, let's instantiate it or use the one from file if exported
    # The file exports `_DBSettings` which is an instance, or `DBSettings` class.
    # checking imports... the file has `class DBSettings` and `_DBSettings = DBSettings()`
    
    # We will instantiate it to be sure we pick up fresh env vars
    db_settings = DBSettings() 
    print(f"Connecting to database...") # Don't print full URL for security logs
    
    engine = create_async_engine(db_settings.db_url)
    
    async with engine.begin() as conn:
        print("Executing ALTER TABLE command...")
        await conn.execute(text("ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS show_iot_hub BOOLEAN DEFAULT TRUE;"))
        print("Column 'show_iot_hub' added successfully.")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_column())
