import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from app.core.database import DBSettings

async def debug_schema():
    db_settings = DBSettings()
    print(f"Connecting to database: {db_settings.db_url}")
    
    engine = create_async_engine(db_settings.db_url)
    
    async with engine.begin() as conn:
        print("\n--- Checking alembic_version ---")
        try:
            result = await conn.execute(text("SELECT version_num FROM alembic_version"))
            version = result.scalar()
            print(f"Current Alembic Version: {version}")
        except Exception as e:
            print(f"Error checking alembic_version: {e}")

        print("\n--- Checking organization_settings columns ---")
        try:
            # Query information_schema to see actual columns
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'organization_settings'
            """))
            columns = result.fetchall()
            found_microsoft = False
            for col in columns:
                print(f"- {col[0]} ({col[1]})")
                if col[0] == 'show_microsoft_hub':
                    found_microsoft = True
            
            if found_microsoft:
                print("\n✅ 'show_microsoft_hub' column EXISTS.")
            else:
                print("\n❌ 'show_microsoft_hub' column MISSING.")
                
        except Exception as e:
            print(f"Error checking columns: {e}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_schema())
