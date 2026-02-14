from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_superuser
from app.core.database import get_db
from app.models.ai_config import AIConfig
from app.models.user import User
from app.schema.ai_config import (
    AIConfigCreate,
    AIConfigUpdate,
    AIConfigSchema,
    AIConfigListResponse
)

router = APIRouter(prefix="/api/admin/ai-config", tags=["ai-config"])


@router.get("", response_model=AIConfigListResponse)
async def list_ai_configs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """List all AI configurations."""
    result = await db.execute(select(AIConfig))
    configs = result.scalars().all()
    return {"configs": configs}


@router.get("/{agent_type}", response_model=AIConfigSchema)
async def get_ai_config(
    agent_type: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Get a specific AI configuration by agent type."""
    result = await db.execute(select(AIConfig).where(AIConfig.agent_type == agent_type))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration for {agent_type} not found",
        )
    return config


@router.post("", response_model=AIConfigSchema, status_code=status.HTTP_201_CREATED)
async def create_or_update_ai_config(
    config_data: AIConfigCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Create or update an AI configuration."""
    result = await db.execute(select(AIConfig).where(AIConfig.agent_type == config_data.agent_type))
    existing_config = result.scalar_one_or_none()

    if existing_config:
        # Update
        for key, value in config_data.model_dump().items():
            setattr(existing_config, key, value)
        config = existing_config
    else:
        # Create
        config = AIConfig(**config_data.model_dump())
        db.add(config)
    
    await db.commit()
    await db.refresh(config)
    return config


@router.patch("/{config_id}", response_model=AIConfigSchema)
async def update_ai_config(
    config_id: int,
    config_data: AIConfigUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: User = Depends(get_current_superuser),
):
    """Update an AI configuration."""
    result = await db.execute(select(AIConfig).where(AIConfig.id == config_id))
    config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found",
        )

    update_data = config_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)

    await db.commit()
    await db.refresh(config)
    return config
