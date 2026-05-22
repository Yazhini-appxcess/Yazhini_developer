from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Association table for User and Permission
user_permissions = Table(
    "user_permissions",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permission.id"), primary_key=True),
)

class Permission(Base):
    __tablename__ = "permission"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationship to users (back-reference)
    users: Mapped[list["User"]] = relationship(
        "User", secondary=user_permissions, back_populates="permissions"
    )

    def __repr__(self) -> str:
        return f"<Permission(name='{self.name}', display_name='{self.display_name}')>"
