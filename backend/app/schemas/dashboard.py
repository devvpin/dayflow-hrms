from pydantic import BaseModel
from typing import List
from app.schemas.notification import NotificationResponse

class AdminDashboardResponse(BaseModel):
    total_employees: int
    attendance_today: int
    pending_leave_requests: int
    recent_notifications: List[NotificationResponse]

class EmployeeDashboardResponse(BaseModel):
    checked_in_today: bool
    pending_leaves: int
    recent_notifications: List[NotificationResponse]
