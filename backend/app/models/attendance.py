from sqlalchemy import Column, Integer, Date, DateTime, String, func, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False) # Present, Absent, Half-day, Leave
    work_hours = Column(Numeric(5, 2), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="attendance")

    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='uix_employee_date'),
    )
