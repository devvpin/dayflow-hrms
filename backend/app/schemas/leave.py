from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from app.models.leave import LeaveType, LeaveStatus

class LeaveBase(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str

class LeaveCreate(LeaveBase):
    pass

class LeaveStatusUpdate(BaseModel):
    status: LeaveStatus

class LeaveResponse(LeaveBase):
    id: int
    employee_id: int
    status: LeaveStatus
    
    model_config = ConfigDict(from_attributes=True)
