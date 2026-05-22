from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.permission import Permission

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    username: Mapped[str] = mapped_column(index=True, unique=True)
    slug: Mapped[str] = mapped_column(index=True, unique=True)
    email: Mapped[str] = mapped_column(index=True, unique=True)
    first_name: Mapped[str]
    last_name: Mapped[str]
    password: Mapped[str]
    is_superuser: Mapped[bool] = mapped_column(default=False)
    user_type: Mapped[str] = mapped_column(String(50), default="admin", server_default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), server_default=func.now())
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Added granular permissions
    permissions: Mapped[list["Permission"]] = relationship(
        "Permission", secondary="user_permissions", back_populates="users"
    )
