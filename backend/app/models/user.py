import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(Role), nullable=False, default=Role.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="user", foreign_keys=[employee_id], uselist=False)
    notifications = relationship("Notification", back_populates="user")
