from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.integration import IntegrationService
from app.router.appxcess import get_current_appxcess

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Pydantic Models
class IntegrationBase(BaseModel):
    category: str
    name: str
    description: str
    logo_url: str
    primary_color: str
    documentation_url: Optional[str] = None
    is_active: bool = True

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    documentation_url: Optional[str] = None
    is_active: Optional[bool] = None

class IntegrationResponse(IntegrationBase):
    id: int

    class Config:
        from_attributes = True

# Public Endpoints
@router.get("", response_model=List[IntegrationResponse])
async def get_integrations(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(IntegrationService).where(IntegrationService.is_active == True)
    if category:
        query = query.where(IntegrationService.category == category)
    
    result = await db.execute(query)
    return result.scalars().all()

# AppXcess Only Endpoints
@router.post("", response_model=IntegrationResponse)
async def create_integration(
    integration: IntegrationCreate,
    db: AsyncSession = Depends(get_db),
    current_appxcess: str = Depends(get_current_appxcess)
):
    db_integration = IntegrationService(**integration.dict())
    db.add(db_integration)
    await db.commit()
    await db.refresh(db_integration)
    return db_integration

@router.put("/{id}", response_model=IntegrationResponse)
async def update_integration(
    id: int,
    integration: IntegrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_appxcess: str = Depends(get_current_appxcess)
):
    result = await db.execute(select(IntegrationService).where(IntegrationService.id == id))
    db_integration = result.scalar_one_or_none()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    update_data = integration.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_integration, key, value)
    
    await db.commit()
    await db.refresh(db_integration)
    return db_integration

@router.delete("/{id}")
async def delete_integration(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_appxcess: str = Depends(get_current_appxcess)
):
    result = await db.execute(select(IntegrationService).where(IntegrationService.id == id))
    db_integration = result.scalar_one_or_none()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    await db.delete(db_integration)
    await db.commit()
    return {"message": "Integration deleted successfully"}
