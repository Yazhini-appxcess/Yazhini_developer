import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.database import Base
from app.models.integration import IntegrationService # Import to register the model
from app.models.zoho_config import ZohoConfig

# Add cwd to path
sys.path.append(os.getcwd())

from app.core.database import Base, DBSettings
from app.models.integration import IntegrationService # Import to register the model
from app.models.zoho_config import ZohoConfig

# Use DB URL from settings
DB_URL = DBSettings().db_url

async def create_tables():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
