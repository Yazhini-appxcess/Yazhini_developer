import os
from pathlib import Path
import shutil
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_superuser
from app.models.user import User
from app.models.settings import OrganizationSettings
from app.router.settings import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/api/appxcess/settings", tags=["appxcess-settings"])

# Reuse the same helper from settings router
async def get_or_create_settings(db: AsyncSession) -> OrganizationSettings:
    result = await db.execute(select(OrganizationSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = OrganizationSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


def _to_appxcess_response(settings: OrganizationSettings) -> dict:
    """
    Map the shared OrganizationSettings row to a response that exposes the Super
    Admin-specific logo/favicon under the standard logo_url/favicon_url fields,
    so the frontend can consume both endpoints uniformly.
    """
    return {
        "company_name": settings.company_name,
        "logo_url": settings.appxcess_logo_url,
        "favicon_url": settings.appxcess_favicon_url,
        "primary_color": settings.primary_color,
        "sidebar_bg_color": settings.sidebar_bg_color,
        "sidebar_text_color": settings.sidebar_text_color,
        "sidebar_enabled": settings.sidebar_enabled,
        "custom_sections": settings.custom_sections,
        "integration_label": settings.integration_label,
        "custom_links_label": settings.custom_links_label,
        "widget_name": settings.widget_name,
        "widget_logo_url": settings.widget_logo_url,
        "widget_primary_color": settings.widget_primary_color,
        "show_dashboard": settings.show_dashboard,
        "show_copilot": settings.show_copilot,
        "show_upload_hub": settings.show_upload_hub,
        "show_documents": settings.show_documents,
        "show_conversations": settings.show_conversations,
        "show_admin_management": settings.show_admin_management,
        "show_activity_log": settings.show_activity_log,
        "show_erp_hub": settings.show_erp_hub,
        "show_crm_hub": settings.show_crm_hub,
        "show_database_hub": settings.show_database_hub,
        "show_api_docs": settings.show_api_docs,
        "show_iot_hub": settings.show_iot_hub,
        "show_microsoft_hub": settings.show_microsoft_hub,
    }


@router.get("", response_model=SettingsResponse)
async def get_appxcess_settings(db: Annotated[AsyncSession, Depends(get_db)]):
    """Get Super Admin (AppXcess) branding settings"""
    settings = await get_or_create_settings(db)
    return _to_appxcess_response(settings)

@router.put("", response_model=SettingsResponse)
async def update_appxcess_settings(
    settings_in: SettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Update Super Admin branding settings (Super Admin only)"""
    settings = await get_or_create_settings(db)
    # Apply same updates as generic settings
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
    # Visibility toggles (copy from original)
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
async def upload_appxcess_logo(
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    type: str = Form(...),  # 'logo' or 'favicon'
    current_user: User = Depends(get_current_superuser),
):
    """Upload logo or favicon for Super Admin branding"""
    settings = await get_or_create_settings(db)
    if type == "favicon":
        allowed = {"image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"}
        if file.content_type not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Favicon must be image/png, image/x-icon, image/svg+xml, or related type",
            )
    upload_dir = Path("data/uploads/branding")
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{type}_{int(settings.id)}{ext}"
    file_path = upload_dir / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file to storage",
        )
    url = f"/static/branding/{filename}"
    if type == "logo":
        settings.logo_url = url
    elif type == "favicon":
        settings.favicon_url = url
    await db.commit()
    await db.refresh(settings)
    return settings
