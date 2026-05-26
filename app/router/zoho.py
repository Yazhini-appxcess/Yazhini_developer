from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.zoho_config import ZohoConfig
from pydantic import BaseModel
from typing import Optional

from app.core.encryption import encrypt_value, decrypt_value
import httpx
from starlette.responses import RedirectResponse
import os
from app.core.settings import settings
from app.core.auth import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/api/zoho", tags=["zoho"])

class ZohoConfigUpdate(BaseModel):
    client_id: str
    client_secret: str
    dc: str = "in"
    organization_id: str = "default"

@router.post("/config")
async def save_zoho_config(
    config: ZohoConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Encrypt secret before storage
    encrypted_secret = encrypt_value(config.client_secret)
    
    # Check if exists
    result = await db.execute(select(ZohoConfig).where(ZohoConfig.organization_id == config.organization_id))
    db_config = result.scalar_one_or_none()
    
    if db_config:
        db_config.client_id = config.client_id
        db_config.client_secret = encrypted_secret
        db_config.dc = config.dc
    else:
        db_config = ZohoConfig(
            organization_id=config.organization_id,
            client_id=config.client_id,
            client_secret=encrypted_secret,
            dc=config.dc
        )
        db.add(db_config)
    
    await db.commit()
    return {"message": "Zoho configuration saved successfully. Now please authorize."}

@router.get("/authorize")
async def authorize_zoho(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    result = await db.execute(select(ZohoConfig).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=400, detail="Zoho config not found. Save credentials first.")
    
    dc_suffix = config.dc if config.dc != "us" else "com"
    auth_url = f"https://accounts.zoho.{dc_suffix}/oauth/v2/auth"
    # Use centralized settings for redirect_uri
    redirect_uri = settings.zoho_redirect_uri
    
    params = {
        "scope": "ZohoCRM.modules.ALL,ZohoCRM.settings.ALL",
        "client_id": config.client_id,
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
        "redirect_uri": redirect_uri
    }
    
    # Simple query string build
    query_str = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"url": f"{auth_url}?{query_str}"}

@router.get("/callback")
async def zoho_callback(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ZohoConfig).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        return {"error": "Config not found during callback"}
    
    dc_suffix = config.dc if config.dc != "us" else "com"
    token_url = f"https://accounts.zoho.{dc_suffix}/oauth/v2/token"
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, params={
            "code": code,
            "client_id": config.client_id,
            "client_secret": decrypt_value(config.client_secret),
            "grant_type": "authorization_code",
            "redirect_uri": settings.zoho_redirect_uri
        })
        
        data = resp.json()
        if "refresh_token" in data:
            config.refresh_token = encrypt_value(data["refresh_token"])
            config.is_active = True
            await db.commit()
            return RedirectResponse(url=f"{settings.frontend_url}/crm/zoho?status=success")
        else:
            return {"error": "Failed to get refresh token", "details": data}

@router.get("/config")
async def get_zoho_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    result = await db.execute(select(ZohoConfig).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        return {}
    return {
        "client_id": config.client_id,
        "dc": config.dc,
        "is_active": config.is_active,
        "has_refresh_token": bool(config.refresh_token)
    }
