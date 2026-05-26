from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.website import WebsiteConfig
from app.schemas.website import WebsiteConfigResponse, WebsiteConfigUpdate, WebsiteConfigCreate
from app.router.appxcess import get_current_appxcess

router = APIRouter(
    prefix="/api/website",
    tags=["website"]
)

@router.get("/config", response_model=WebsiteConfigResponse)
async def get_website_config(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WebsiteConfig))
    config = result.scalars().first()
    
    if not config:
        # Create default config if none exists
        config = WebsiteConfig()
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config

@router.put("/config", response_model=WebsiteConfigResponse)
async def update_website_config(
    config_data: WebsiteConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_appxcess: str = Depends(get_current_appxcess)
):
    result = await db.execute(select(WebsiteConfig))
    config = result.scalars().first()
    
    if not config:
        config = WebsiteConfig(**config_data.dict())
        db.add(config)
    else:
        for key, value in config_data.dict(exclude_unset=True).items():
            setattr(config, key, value)
            
    await db.commit()
    await db.refresh(config)
    return config
