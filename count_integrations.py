import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

# Add cwd to path
sys.path.append(os.getcwd())

# Hardcoded PG URL
DB_URL = "postgresql+asyncpg://postgres:vibi2003@localhost:5432/cormanleigh_bot"

async def count():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        try:
            result = await session.execute(text("SELECT count(*) FROM integration_services"))
            count = result.scalar()
            print(f"Total rows in integration_services: {count}")
        except Exception as e:
            print(f"Error querying data: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(count())
