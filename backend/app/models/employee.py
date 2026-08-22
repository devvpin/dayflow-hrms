from sqlalchemy import Column, Integer, String, Date, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", use_alter=True), unique=True, nullable=True)
    
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    joining_date = Column(Date, nullable=True)
    profile_picture = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="employee", foreign_keys=[user_id], uselist=False)
    attendance = relationship("Attendance", back_populates="employee")
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    payroll = relationship("Payroll", back_populates="employee", uselist=False)
