from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from pathlib import Path
import shutil
import os

from app.core.database import get_db
from app.core.auth import get_current_admin, get_current_superuser
from app.models.user import User
from app.models.settings import OrganizationSettings

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Schema
class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    primary_color: Optional[str] = None
    sidebar_bg_color: Optional[str] = None
    sidebar_text_color: Optional[str] = None
    sidebar_enabled: Optional[bool] = None
    integration_label: Optional[str] = None
    custom_links_label: Optional[str] = None
    custom_sections: Optional[list] = None
    widget_name: Optional[str] = None
    widget_primary_color: Optional[str] = None
    
    # Visibility Toggles
    show_dashboard: Optional[bool] = None
    show_copilot: Optional[bool] = None
    show_upload_hub: Optional[bool] = None
    show_documents: Optional[bool] = None
    show_conversations: Optional[bool] = None
    show_admin_management: Optional[bool] = None
    show_activity_log: Optional[bool] = None
    show_erp_hub: Optional[bool] = None
    show_crm_hub: Optional[bool] = None
    show_database_hub: Optional[bool] = None
    show_api_docs: Optional[bool] = None
    show_iot_hub: Optional[bool] = None
    show_microsoft_hub: Optional[bool] = None

class SettingsResponse(BaseModel):
    company_name: str
    logo_url: Optional[str]
    favicon_url: Optional[str]
    primary_color: str
    sidebar_bg_color: str
    sidebar_enabled: bool
    custom_sections: Optional[list] = None
    integration_label: str
    custom_links_label: str
    sidebar_text_color: str
    widget_name: str
    widget_logo_url: Optional[str]
    widget_primary_color: str

    # Sidebar Item Visibility
    show_dashboard: Optional[bool] = True
    show_copilot: Optional[bool] = True
    show_upload_hub: Optional[bool] = True
    show_documents: Optional[bool] = True
    show_conversations: Optional[bool] = True
    show_admin_management: Optional[bool] = True
    show_activity_log: Optional[bool] = True
    show_erp_hub: Optional[bool] = True
    show_crm_hub: Optional[bool] = True
    show_database_hub: Optional[bool] = True
    show_api_docs: Optional[bool] = True
    show_iot_hub: Optional[bool] = True
    show_microsoft_hub: Optional[bool] = True

    class Config:
        from_attributes = True

# Helper to get or create settings
async def get_or_create_settings(db: AsyncSession) -> OrganizationSettings:
    result = await db.execute(select(OrganizationSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = OrganizationSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings

@router.get("", response_model=SettingsResponse)
async def get_settings(
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get current organization settings"""
    return await get_or_create_settings(db)

@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_in: SettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser)
):
    """Update organization settings (Super Admin only)"""
    settings = await get_or_create_settings(db)
    
    if settings_in.company_name is not None:
        settings.company_name = settings_in.company_name
    if settings_in.primary_color is not None:
        settings.primary_color = settings_in.primary_color
    if settings_in.sidebar_bg_color is not None:
        settings.sidebar_bg_color = settings_in.sidebar_bg_color
    if settings_in.sidebar_text_color is not None:
        settings.sidebar_text_color = settings_in.sidebar_text_color
    if settings_in.sidebar_enabled is not None:
        settings.sidebar_enabled = settings_in.sidebar_enabled
    if settings_in.integration_label is not None:
        settings.integration_label = settings_in.integration_label
    if settings_in.custom_links_label is not None:
        settings.custom_links_label = settings_in.custom_links_label
    if settings_in.custom_sections is not None:
        settings.custom_sections = settings_in.custom_sections
    if settings_in.widget_name is not None:
        settings.widget_name = settings_in.widget_name
    if settings_in.widget_primary_color is not None:
        settings.widget_primary_color = settings_in.widget_primary_color
    
    # Visibility Toggles
    if settings_in.show_dashboard is not None:
        settings.show_dashboard = settings_in.show_dashboard
    if settings_in.show_copilot is not None:
        settings.show_copilot = settings_in.show_copilot
    if settings_in.show_upload_hub is not None:
        settings.show_upload_hub = settings_in.show_upload_hub
    if settings_in.show_documents is not None:
        settings.show_documents = settings_in.show_documents
    if settings_in.show_conversations is not None:
        settings.show_conversations = settings_in.show_conversations
    if settings_in.show_admin_management is not None:
        settings.show_admin_management = settings_in.show_admin_management
    if settings_in.show_activity_log is not None:
        settings.show_activity_log = settings_in.show_activity_log
    if settings_in.show_erp_hub is not None:
        settings.show_erp_hub = settings_in.show_erp_hub
    if settings_in.show_crm_hub is not None:
        settings.show_crm_hub = settings_in.show_crm_hub
    if settings_in.show_database_hub is not None:
        settings.show_database_hub = settings_in.show_database_hub
    if settings_in.show_api_docs is not None:
        settings.show_api_docs = settings_in.show_api_docs
    if settings_in.show_iot_hub is not None:
        settings.show_iot_hub = settings_in.show_iot_hub
    if settings_in.show_microsoft_hub is not None:
        settings.show_microsoft_hub = settings_in.show_microsoft_hub
        
    await db.commit()
    await db.refresh(settings)
    return settings

@router.post("/logo", response_model=SettingsResponse)
async def upload_logo(
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    type: str = Form(...), # 'logo' or 'favicon'
    current_user: User = Depends(get_current_superuser)
):
    """Upload logo or favicon"""
    settings = await get_or_create_settings(db)
    
    # Save file
    upload_dir = Path("data/uploads/branding")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{type}_{int(settings.id)}{file_ext}"
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Construct URL (assuming static file serving is set up or will be)
    # For now, return relative path that frontend can use with API base URL
    file_url = f"/static/branding/{filename}"
    
    if type == "logo":
        settings.logo_url = file_url
    elif type == "favicon":
        settings.favicon_url = file_url
    elif type == "widget_logo":
        settings.widget_logo_url = file_url
        
    await db.commit()
    await db.refresh(settings)
    return settings
