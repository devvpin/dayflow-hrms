import enum
from sqlalchemy import Column, Integer, Date, DateTime, String, Enum as SQLEnum, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class LeaveType(str, enum.Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(SQLEnum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String, nullable=True)
    status = Column(SQLEnum(LeaveStatus), nullable=False, default=LeaveStatus.PENDING)
    admin_comments = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="leave_requests")
