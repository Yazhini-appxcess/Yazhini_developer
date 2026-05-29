import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

# Add cwd to path
sys.path.append(os.getcwd())

from app.models.integration import IntegrationService
from app.core.database import Base # Import Base to ensure mapper is registered if needed

# Hardcoded PG URL
DB_URL = "postgresql+asyncpg://postgres:7373021545@localhost:5432/generic_bot"

async def seed():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL, echo=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        print("Session created. Checking for existing data...")
        try:
            result = await session.execute(select(IntegrationService))
            if result.scalars().first():
                print("Integrations already seeded.")
            else:
                print("Seeding data...")
                integrations = [
                    # ERP
                    {
                        "category": "erp",
                        "name": "SAP S/4HANA",
                        "description": "Enterprise resource planning suite for large enterprises.",
                        "logo_url": "/static/integrations/sap.png",
                        "primary_color": "#008FD3",
                        "documentation_url": "https://help.sap.com",
                    },
                    {
                        "category": "erp",
                        "name": "Oracle NetSuite",
                        "description": "Unified business management suite.",
                        "logo_url": "/static/integrations/netsuite.png",
                        "primary_color": "#000000",
                        "documentation_url": "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/",
                    },
                    # CRM
                    {
                        "category": "crm",
                        "name": "Salesforce",
                        "description": "Leading CRM platform.",
                        "logo_url": "/static/integrations/salesforce.png",
                        "primary_color": "#00A1E0",
                        "documentation_url": "https://developer.salesforce.com",
                    },
                    {
                        "category": "crm",
                        "name": "HubSpot",
                        "description": "Inbound marketing, sales, and service software.",
                        "logo_url": "/static/integrations/hubspot.png",
                        "primary_color": "#FF7A59",
                        "documentation_url": "https://developers.hubspot.com",
                    },
                    # Database
                    {
                        "category": "database",
                        "name": "PostgreSQL",
                        "description": "Advanced open source relational database.",
                        "logo_url": "/static/integrations/postgresql.png",
                        "primary_color": "#336791",
                        "documentation_url": "https://www.postgresql.org/docs/",
                    },
                    {
                        "category": "database",
                        "name": "MongoDB",
                        "description": "Document-oriented NoSQL database.",
                        "logo_url": "/static/integrations/mongodb.png",
                        "primary_color": "#47A248",
                        "documentation_url": "https://www.mongodb.com/docs/",
                    },
                ]

                for data in integrations:
                    item = IntegrationService(**data)
                    session.add(item)
                
                await session.commit()
                print("Successfully seeded integration data!")
        except Exception as e:
            print(f"Error seeding data: {e}")
            import traceback
            traceback.print_exc()

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
