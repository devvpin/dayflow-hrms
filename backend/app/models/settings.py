from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), default="Dayflow Inc.")
    company_email = Column(String(255), default="contact@dayflow.com")
    company_address = Column(String(500), default="123 Business Avenue, Tech District")
    working_hours = Column(String(100), default="09:00 - 18:00")
    
    allow_employee_registration = Column(Boolean, default=True)
    require_approval_for_leaves = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
