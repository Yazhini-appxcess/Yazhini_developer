import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import DBSessionManager
from app.models.integration import IntegrationService

async def seed_integrations():
    async with DBSessionManager.session() as session:
        # Check if data exists
        result = await session.execute(select(IntegrationService))
        if result.scalars().first():
            print("Integrations already seeded.")
            return

        integrations = [
            # ERP
            {
                "category": "erp",
                "name": "Sage Connect",
                "description": "Enterprise ERP connection for financial and operational data synchronization.",
                "logo_url": "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
                "primary_color": "#00DC80",
                "documentation_url": "/sage-300",
                "is_active": True
            },
            {
                "category": "erp",
                "name": "Procore",
                "description": "Sync construction projects, documents, and RFI data directly with Leucadia.",
                "logo_url": "https://www.google.com/s2/favicons?domain=procore.com&sz=128",
                "primary_color": "#000000",
                "documentation_url": "/procore",
                "is_active": True
            },
            {
                "category": "erp",
                "name": "Oracle ERP Cloud",
                "description": "Connect to Oracle Fusion Cloud ERP via REST APIs for enterprise resource syncing.",
                "logo_url": "https://www.google.com/s2/favicons?domain=oracle.com&sz=128",
                "primary_color": "#F80000",
                "documentation_url": "/erp/oracle",
                "is_active": True
            },
             {
                "category": "erp",
                "name": "SAP Business One",
                "description": "Integrate with SAP Service Layer to sync business partners and accounting records.",
                "logo_url": "https://www.google.com/s2/favicons?domain=sap.com&sz=128",
                "primary_color": "#008FD3",
                "documentation_url": "/erp/sap",
                "is_active": True
            },
            # CRM
            {
                "category": "crm",
                "name": "Zoho CRM",
                "description": "Sync leads, contacts, and deal information to ground AI responses in actual customer data.",
                "logo_url": "https://www.google.com/s2/favicons?domain=zoho.com&sz=128",
                "primary_color": "#000000",
                "documentation_url": "/crm/zoho",
                "is_active": True
            },
            {
                "category": "crm",
                "name": "Salesforce",
                "description": "Enterprise-grade Lightning integration for deep CRM knowledge indexing.",
                "logo_url": "https://www.google.com/s2/favicons?domain=salesforce.com&sz=128",
                "primary_color": "#00A1E0",
                "documentation_url": "/crm/salesforce",
                "is_active": True
            },
             {
                "category": "crm",
                "name": "HubSpot",
                "description": "Connect marketing, sales, and service hubs to provide a 360-degree customer view.",
                "logo_url": "https://www.google.com/s2/favicons?domain=hubspot.com&sz=128",
                "primary_color": "#FF7A59",
                "documentation_url": "/crm/hubspot",
                "is_active": True
            },
            {
                "category": "crm",
                "name": "Pipedrive",
                "description": "Analyze sales pipelines and deal flows to drive intelligent AI recommendations.",
                "logo_url": "https://www.google.com/s2/favicons?domain=pipedrive.com&sz=128",
                "primary_color": "#06211C",
                "documentation_url": "/crm/pipedrive",
                "is_active": True
            },
            # Database
            {
                "category": "database",
                "name": "PostgreSQL",
                "description": "Standard open-source relational database for robust document and record storage.",
                "logo_url": "https://www.google.com/s2/favicons?domain=postgresql.org&sz=128",
                "primary_color": "#336791",
                "documentation_url": "/database/postgresql",
                "is_active": True
            },
            {
                "category": "database",
                "name": "MySQL",
                "description": "Widely used relational database for general purpose data indexing and retrieval.",
                "logo_url": "https://www.google.com/s2/favicons?domain=mysql.com&sz=128",
                "primary_color": "#00758F",
                "documentation_url": "/database/mysql",
                "is_active": True
            },
             {
                "category": "database",
                "name": "Microsoft SQL Server",
                "description": "Enterprise-level relational database for high-performance specialized data sets.",
                "logo_url": "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
                "primary_color": "#CC2927",
                "documentation_url": "/database/sqlserver",
                "is_active": True
            },
            {
                "category": "database",
                "name": "MongoDB",
                "description": "NoSQL document database for flexible JSON-like data ingestion and searching.",
                "logo_url": "https://www.google.com/s2/favicons?domain=mongodb.com&sz=128",
                "primary_color": "#47A248",
                "documentation_url": "/database/mongodb",
                "is_active": True
            },
             {
                "category": "database",
                "name": "Oracle DB",
                "description": "Connect to legacy Oracle instances for deep enterprise knowledge base indexing.",
                "logo_url": "https://www.google.com/s2/favicons?domain=oracle.com&sz=128",
                "primary_color": "#F80000",
                "documentation_url": "/database/oracle",
                "is_active": True
            },
            {
                "category": "database",
                "name": "Supabase",
                "description": "Modern cloud-native Postgres with built-in vector support for AI applications.",
                "logo_url": "https://www.google.com/s2/favicons?domain=supabase.com&sz=128",
                "primary_color": "#3ECF8E",
                "documentation_url": "/database/supabase",
                "is_active": True
            }
        ]

        for data in integrations:
            integration = IntegrationService(**data)
            session.add(integration)
        
        await session.commit()
        print("Successfully seeded integration data!")

if __name__ == "__main__":
    asyncio.run(seed_integrations())
