from sqlalchemy import Column, Integer, Date, DateTime, Numeric, func, ForeignKey, UniqueConstraint
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

    # Prevents duplicate payroll rows for the same employee + effective date,
    # including under concurrent requests (the check-then-insert in the service
    # is not atomic on its own).
    __table_args__ = (
        UniqueConstraint('employee_id', 'effective_from', name='uix_payroll_employee_effective'),
    )
