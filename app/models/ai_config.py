from datetime import datetime
from sqlalchemy import String, Text, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AIConfig(Base):
    __tablename__ = "ai_config"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    agent_type: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    system_prompt: Mapped[str] = mapped_column(Text)
    model: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini")
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
