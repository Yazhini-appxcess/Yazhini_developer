from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AIConfigBase(BaseModel):
    agent_type: str
    system_prompt: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7


class AIConfigCreate(AIConfigBase):
    pass


class AIConfigUpdate(BaseModel):
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None


class AIConfigSchema(AIConfigBase):
    id: int
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AIConfigListResponse(BaseModel):
    configs: list[AIConfigSchema]
