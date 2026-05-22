from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.core.database import Base

class ZohoConfig(Base):
    __tablename__ = "zoho_config"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    organization_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    client_id: Mapped[str] = mapped_column(String(255))
    client_secret: Mapped[str] = mapped_column(String(255))
    refresh_token: Mapped[str | None] = mapped_column(String(500), nullable=True)
    dc: Mapped[str] = mapped_column(String(10), default="in")  # in, us, eu, au, jp
    is_active: Mapped[bool] = mapped_column(default=True)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
