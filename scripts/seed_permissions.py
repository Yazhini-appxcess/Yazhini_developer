import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import DBSessionManager
from app.models.permission import Permission

PERMISSIONS = [
    {"name": "dashboard_access", "display_name": "Dashboard", "description": "Access to the main dashboard/overview page"},
    {"name": "copilot_access", "display_name": "Copilot", "description": "Access to the AI Copilot features"},
    {"name": "upload_hub_access", "display_name": "Upload Hub", "description": "Access to the document upload center"},
    {"name": "document_library_access", "display_name": "Document Library", "description": "Access to view the document library"},
    {"name": "conversations_access", "display_name": "Conversations", "description": "Access to chat history and conversations"},
    {"name": "activity_log_access", "display_name": "Activity Log", "description": "Access to the system activity log"},
    {"name": "users_access", "display_name": "User Management", "description": "Access to manage system users and permissions"},
    {"name": "document_uploading", "display_name": "Document Uploading", "description": "Permission to upload new documents"},
    {"name": "document_deletion", "display_name": "Document Deletion", "description": "Permission to delete documents from the system"},
]

async def seed_permissions():
    """Seed the permissions table."""
    async with DBSessionManager.session() as db:
        for perm_data in PERMISSIONS:
            # Check if permission already exists
            result = await db.execute(select(Permission).where(Permission.name == perm_data["name"]))
            existing_perm = result.scalar_one_or_none()

            if existing_perm:
                # Update existing permission
                existing_perm.display_name = perm_data["display_name"]
                existing_perm.description = perm_data["description"]
                print(f"Updated permission: {perm_data['name']}")
            else:
                # Create new permission
                new_perm = Permission(
                    name=perm_data["name"],
                    display_name=perm_data["display_name"],
                    description=perm_data["description"]
                )
                db.add(new_perm)
                print(f"Created permission: {perm_data['name']}")
        
        await db.commit()
        print("Permissions seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_permissions())
