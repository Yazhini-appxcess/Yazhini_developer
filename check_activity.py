import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.database import _DBSettings

async def check_activity():
    url = _DBSettings.db_url
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT id, user_id, action, details, timestamp FROM activity_log ORDER BY timestamp DESC LIMIT 50"))
            rows = result.fetchall()
            print("Activity logs:")
            for row in rows:
                print(f"ID: {row[0]}, UserID: {row[1]}, Action: {row[2]}, Details: {row[3]}, Timestamp: {row[4]}")
    except Exception as e:
        print("Failed to query activity_log table")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_activity())
