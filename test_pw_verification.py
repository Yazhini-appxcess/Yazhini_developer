import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.database import _DBSettings
from app.core.auth import verify_password

async def test_pw():
    url = _DBSettings.db_url
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            result = await conn.execute(text('SELECT password FROM "user" WHERE email = \'superadmin@gmail.com\''))
            row = result.fetchone()
            if row:
                hashed = row[0]
                print("Hashed password in DB:", hashed)
                
                # Check for common candidate passwords
                candidates = ["Superadmin@123", "Admin@123", "admin", "password", "123456", "superadmin"]
                for cand in candidates:
                    match = verify_password(cand, hashed)
                    print(f"Candidate '{cand}': {'MATCH' if match else 'NO MATCH'}")
            else:
                print("Superadmin user not found in DB")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test_pw())
