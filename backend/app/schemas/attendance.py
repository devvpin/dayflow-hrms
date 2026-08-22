from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    work_hours: Optional[Decimal] = None
    
    model_config = ConfigDict(from_attributes=True)
