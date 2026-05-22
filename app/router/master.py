"""Router for Master Dashboard (System Owner)."""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import shutil
import os
from pathlib import Path

from app.core.auth import (
    create_access_token,
    verify_password,
    SECRET_KEY,
    ALGORITHM,
    get_password_hash
)
from app.core.database import get_db
from app.models.settings import OrganizationSettings

router = APIRouter(prefix="/api/master", tags=["master"])
security = HTTPBearer()

# Hardcoded Master Credentials (isolated from DB)
MASTER_EMAIL = "master@leucadia.com"
MASTER_PASSWORD_HASH = get_password_hash("MasterAccess2026!")

class MasterLoginRequest(BaseModel):
    email: EmailStr
    password: str

class MasterLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    primary_color: Optional[str] = None
    sidebar_bg_color: Optional[str] = None
    sidebar_text_color: Optional[str] = None
    sidebar_enabled: Optional[bool] = None

    # Sidebar Item Visibility
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
    show_mes_hub: Optional[bool] = None
    custom_sections: Optional[list] = None
    integration_label: Optional[str] = None
    custom_links_label: Optional[str] = None
    
    # Widget Configuration
    widget_name: Optional[str] = None
    widget_primary_color: Optional[str] = None
    widget_logo_url: Optional[str] = None

async def get_current_master(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependency to verify Master token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate master credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        # Check against hardcoded email
        if email != MASTER_EMAIL:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

async def get_or_create_settings(db: AsyncSession) -> OrganizationSettings:
    """Helper to get or create settings (replicated for isolation)."""
    result = await db.execute(select(OrganizationSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = OrganizationSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings

@router.post("/login", response_model=MasterLoginResponse)
async def master_login(login_data: MasterLoginRequest):
    """Login for Master Dashboard."""
    # Verify Email
    if login_data.email != MASTER_EMAIL:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect master credentials",
        )
    
    # Verify Password
    if login_data.password != "MasterAccess2026!":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect master credentials",
        )

    # Create Token
    access_token = create_access_token(data={"sub": MASTER_EMAIL, "role": "master"})
    return MasterLoginResponse(access_token=access_token)

@router.get("/verify")
async def verify_master_token(
    current_master: str = Depends(get_current_master)
):
    """Verify validity of master token."""
    return {"status": "valid", "user": current_master}


@router.put("/settings")
async def update_master_settings(
    settings_in: SettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_master: str = Depends(get_current_master)
):
    """Update organization settings via Master Dashboard."""
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

    # Sidebar Item Visibility
    if settings_in.show_dashboard is not None: settings.show_dashboard = settings_in.show_dashboard
    if settings_in.show_copilot is not None: settings.show_copilot = settings_in.show_copilot
    if settings_in.show_upload_hub is not None: settings.show_upload_hub = settings_in.show_upload_hub
    if settings_in.show_documents is not None: settings.show_documents = settings_in.show_documents
    if settings_in.show_conversations is not None: settings.show_conversations = settings_in.show_conversations
    if settings_in.show_admin_management is not None: settings.show_admin_management = settings_in.show_admin_management
    if settings_in.show_activity_log is not None: settings.show_activity_log = settings_in.show_activity_log
    if settings_in.show_erp_hub is not None: settings.show_erp_hub = settings_in.show_erp_hub
    if settings_in.show_crm_hub is not None: settings.show_crm_hub = settings_in.show_crm_hub
    if settings_in.show_database_hub is not None: settings.show_database_hub = settings_in.show_database_hub
    if settings_in.show_api_docs is not None: settings.show_api_docs = settings_in.show_api_docs
    if settings_in.show_iot_hub is not None: settings.show_iot_hub = settings_in.show_iot_hub
    if settings_in.show_microsoft_hub is not None: settings.show_microsoft_hub = settings_in.show_microsoft_hub
    if settings_in.show_mes_hub is not None: settings.show_mes_hub = settings_in.show_mes_hub
    if settings_in.custom_sections is not None: settings.custom_sections = settings_in.custom_sections
    if settings_in.integration_label is not None: settings.integration_label = settings_in.integration_label
    if settings_in.custom_links_label is not None: settings.custom_links_label = settings_in.custom_links_label
    if settings_in.widget_name is not None: settings.widget_name = settings_in.widget_name
    if settings_in.widget_primary_color is not None: settings.widget_primary_color = settings_in.widget_primary_color
        
    await db.commit()
    await db.refresh(settings)
    return settings

@router.post("/upload")
async def upload_master_asset(
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    type: str = Form(...), # 'logo' or 'favicon'
    current_master: str = Depends(get_current_master)
):
    """Upload logo or favicon via Master Dashboard."""
    settings = await get_or_create_settings(db)
    
    # Save file
    upload_dir = Path("data/uploads/branding")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{type}_{int(settings.id)}{file_ext}"
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
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

# AI Config Management
from app.models.ai_config import AIConfig
from app.schema.ai_config import AIConfigListResponse, AIConfigUpdate, AIConfigSchema, AIConfigCreate

@router.get("/ai-config", response_model=AIConfigListResponse)
async def get_ai_configs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: str = Depends(get_current_master)
):
    """Get all AI configurations."""
    result = await db.execute(select(AIConfig))
    configs = result.scalars().all()
    return AIConfigListResponse(configs=configs)

@router.post("/ai-config", response_model=AIConfigSchema)
async def update_ai_config(
    config_data: AIConfigCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: str = Depends(get_current_master)
):
    """Update or create AI configuration."""
    # Check if config exists for this agent type
    result = await db.execute(select(AIConfig).where(AIConfig.agent_type == config_data.agent_type))
    config = result.scalar_one_or_none()
    
    if config:
        # Update existing
        config.system_prompt = config_data.system_prompt
        config.model = config_data.model
        config.temperature = config_data.temperature
    else:
        # Create new
        config = AIConfig(
            agent_type=config_data.agent_type,
            system_prompt=config_data.system_prompt,
            model=config_data.model,
            temperature=config_data.temperature
        )
        db.add(config)
    
    await db.commit()
    await db.refresh(config)
    return config
