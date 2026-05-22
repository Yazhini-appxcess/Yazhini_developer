import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Add cwd to path
sys.path.append(os.getcwd())

# Hardcoded PG URL
DB_URL = "postgresql+asyncpg://postgres:vibi2003@localhost:5432/cormanleigh_bot"

async def reset_version():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL)
    
    async with engine.begin() as conn:
        try:
            print("Resetting alembic_version to '3fb6b1122f29'...")
            # Using DELETE and INSERT to be safe, or UPDATE
            await conn.execute(text("DELETE FROM alembic_version"))
            await conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('3fb6b1122f29')"))
            print("Successfully reset alembic_version.")
        except Exception as e:
            print(f"Error checking version: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_version())
