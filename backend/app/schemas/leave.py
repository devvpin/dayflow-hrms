from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from app.models.leave import LeaveType, LeaveStatus
from app.schemas.employee import EmployeeResponse

class LeaveBase(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str

class LeaveCreate(LeaveBase):
    pass

class LeaveStatusUpdate(BaseModel):
    status: LeaveStatus
    admin_comment: Optional[str] = None

class LeaveResponse(LeaveBase):
    id: int
    employee_id: int
    status: LeaveStatus
    admin_comments: Optional[str] = None
    employee: Optional[EmployeeResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
