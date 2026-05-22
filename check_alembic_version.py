import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Add cwd to path
sys.path.append(os.getcwd())

# Hardcoded PG URL
DB_URL = "postgresql+asyncpg://postgres:vibi2003@localhost:5432/cormanleigh_bot"

async def check_version():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL)
    
    async with engine.connect() as conn:
        try:
            result = await conn.execute(text("SELECT version_num FROM alembic_version"))
            version = result.scalar()
            print(f"Current Alembic Revision: {version}")
        except Exception as e:
            print(f"Error checking version: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_version())
