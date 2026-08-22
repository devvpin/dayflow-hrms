from sqlalchemy import Column, Integer, Date, DateTime, Numeric, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    basic_salary = Column(Numeric(10, 2), nullable=False)
    allowances = Column(Numeric(10, 2), nullable=False, default=0)
    deductions = Column(Numeric(10, 2), nullable=False, default=0)
    net_salary = Column(Numeric(10, 2), nullable=False)
    effective_from = Column(Date, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="payroll")
