from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime, JSON
from app.core.database import Base

class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    company_name: Mapped[str] = mapped_column(String(100), default="Default Company")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Super Admin (AppXcess) branding — kept separate from tenant/General Admin branding
    appxcess_logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    appxcess_favicon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    primary_color: Mapped[str] = mapped_column(String(20), default="#0f172a")  # Default Slate-900
    sidebar_bg_color: Mapped[str] = mapped_column(String(20), default="#ffffff")
    sidebar_text_color: Mapped[str] = mapped_column(String(20), default="#0f172a")
    sidebar_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Widget Customization
    widget_name: Mapped[str] = mapped_column(String(100), default="Leucadia Assistant")
    widget_logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    widget_primary_color: Mapped[str] = mapped_column(String(20), default="#0f172a")
    
    # Category Labels
    integration_label: Mapped[str] = mapped_column(String(100), default="Integration")
    custom_links_label: Mapped[str] = mapped_column(String(100), default="Custom Links")

    # Custom Sections (JSON list of objects: {title, links: [{name, href, icon}]})
    custom_sections: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)

    # Sidebar Item Visibility
    show_dashboard: Mapped[bool] = mapped_column(Boolean, default=True)
    show_copilot: Mapped[bool] = mapped_column(Boolean, default=True)
    show_upload_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_documents: Mapped[bool] = mapped_column(Boolean, default=True)
    show_conversations: Mapped[bool] = mapped_column(Boolean, default=True)
    show_admin_management: Mapped[bool] = mapped_column(Boolean, default=True)
    show_activity_log: Mapped[bool] = mapped_column(Boolean, default=True)
    show_erp_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_crm_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_database_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_api_docs: Mapped[bool] = mapped_column(Boolean, default=True)
    show_iot_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_microsoft_hub: Mapped[bool] = mapped_column(Boolean, default=True)
    show_mes_hub: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
