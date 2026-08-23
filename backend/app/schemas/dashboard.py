from pydantic import BaseModel
from typing import List
from app.schemas.notification import NotificationResponse

from typing import List, Optional

class AttendanceSubStats(BaseModel):
    present_days: int
    absent_days: int

class LeaveSubStats(BaseModel):
    pending_requests: int
    available_leaves: int

class PayrollSubStats(BaseModel):
    latest_net_salary: float

class TodayAttendanceSubStats(BaseModel):
    status: str
    check_in: Optional[str]
    check_out: Optional[str]
    work_hours: Optional[str]

class AdminDashboardResponse(BaseModel):
    total_employees: int
    active_employees: int
    attendance_today: int
    pending_leave_requests: int
    on_leave_today: int
    recent_notifications: List[NotificationResponse]

class EmployeeDashboardResponse(BaseModel):
    attendance: AttendanceSubStats
    leave: LeaveSubStats
    payroll: PayrollSubStats
    recent_activity: List[str] = []
    today_attendance: Optional[TodayAttendanceSubStats]
    recent_notifications: List[NotificationResponse]
