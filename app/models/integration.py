from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.database import Base

class IntegrationService(Base):
    __tablename__ = "integration_services"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)  # 'erp', 'crm', 'database', 'api'
    name = Column(String, index=True)
    description = Column(Text)
    logo_url = Column(String)
    primary_color = Column(String)
    documentation_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
