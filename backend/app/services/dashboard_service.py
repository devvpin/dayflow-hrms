from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone
import asyncio

from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.notification import Notification

async def get_admin_dashboard_stats(db: AsyncSession) -> dict:
    today = datetime.now(timezone.utc).date()
    
    emp_count_stmt = select(func.count()).select_from(Employee)
    att_count_stmt = select(func.count()).select_from(Attendance).where(Attendance.date == today)
    leave_count_stmt = select(func.count()).select_from(LeaveRequest).where(LeaveRequest.status == LeaveStatus.PENDING)
    notif_stmt = select(Notification).order_by(Notification.created_at.desc()).limit(5)
    
    emp_res = await db.execute(emp_count_stmt)
    att_res = await db.execute(att_count_stmt)
    leave_res = await db.execute(leave_count_stmt)
    notif_res = await db.execute(notif_stmt)
    
    return {
        "total_employees": emp_res.scalar() or 0,
        "attendance_today": att_res.scalar() or 0,
        "pending_leave_requests": leave_res.scalar() or 0,
        "recent_notifications": notif_res.scalars().all()
    }

async def get_employee_dashboard_stats(db: AsyncSession, employee_id: int, user_id: int) -> dict:
    today = datetime.now(timezone.utc).date()
    
    att_stmt = select(Attendance).where(Attendance.employee_id == employee_id, Attendance.date == today)
    leave_count_stmt = select(func.count()).select_from(LeaveRequest).where(
        LeaveRequest.employee_id == employee_id, 
        LeaveRequest.status == LeaveStatus.PENDING
    )
    notif_stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(5)
    
    att_res = await db.execute(att_stmt)
    leave_res = await db.execute(leave_count_stmt)
    notif_res = await db.execute(notif_stmt)
    
    return {
        "checked_in_today": att_res.scalars().first() is not None,
        "pending_leaves": leave_res.scalar() or 0,
        "recent_notifications": notif_res.scalars().all()
    }
