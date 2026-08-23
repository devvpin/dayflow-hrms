from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone
import asyncio

from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.notification import Notification
from app.models.user import User

async def get_admin_dashboard_stats(db: AsyncSession) -> dict:
    today = datetime.now(timezone.utc).date()
    
    emp_count_stmt = select(func.count()).select_from(Employee)
    active_count_stmt = (
        select(func.count())
        .select_from(Employee)
        .join(User, Employee.user_id == User.id)
        .where(User.is_active == True)
    )
    att_count_stmt = select(func.count()).select_from(Attendance).where(Attendance.date == today)
    leave_count_stmt = select(func.count()).select_from(LeaveRequest).where(LeaveRequest.status == LeaveStatus.PENDING)
    on_leave_stmt = select(func.count()).select_from(LeaveRequest).where(
        LeaveRequest.status == LeaveStatus.APPROVED,
        LeaveRequest.start_date <= today,
        LeaveRequest.end_date >= today,
    )
    notif_stmt = select(Notification).order_by(Notification.created_at.desc()).limit(5)

    emp_res = await db.execute(emp_count_stmt)
    active_res = await db.execute(active_count_stmt)
    att_res = await db.execute(att_count_stmt)
    leave_res = await db.execute(leave_count_stmt)
    on_leave_res = await db.execute(on_leave_stmt)
    notif_res = await db.execute(notif_stmt)

    return {
        "total_employees": emp_res.scalar() or 0,
        "active_employees": active_res.scalar() or 0,
        "attendance_today": att_res.scalar() or 0,
        "pending_leave_requests": leave_res.scalar() or 0,
        "on_leave_today": on_leave_res.scalar() or 0,
        "recent_notifications": notif_res.scalars().all()
    }

async def get_employee_dashboard_stats(db: AsyncSession, employee_id: int, user_id: int) -> dict:
    today = datetime.now(timezone.utc).date()
    
    # 1. Attendance SubStats (current month, counted by status)
    present_stmt = select(func.count()).select_from(Attendance).where(
        Attendance.employee_id == employee_id,
        func.extract('year', Attendance.date) == today.year,
        func.extract('month', Attendance.date) == today.month,
        func.lower(Attendance.status) == "present"
    )
    absent_stmt = select(func.count()).select_from(Attendance).where(
        Attendance.employee_id == employee_id,
        func.extract('year', Attendance.date) == today.year,
        func.extract('month', Attendance.date) == today.month,
        func.lower(Attendance.status) == "absent"
    )
    present_res = await db.execute(present_stmt)
    present_days = present_res.scalar() or 0
    absent_res = await db.execute(absent_stmt)
    absent_days = absent_res.scalar() or 0
    
    # 2. Leave SubStats
    leave_count_stmt = select(func.count()).select_from(LeaveRequest).where(
        LeaveRequest.employee_id == employee_id, 
        LeaveRequest.status == LeaveStatus.PENDING
    )
    leave_res = await db.execute(leave_count_stmt)
    pending_requests = leave_res.scalar() or 0
    
    # 3. Payroll SubStats
    from app.models.payroll import Payroll
    payroll_stmt = select(Payroll).where(Payroll.employee_id == employee_id).order_by(Payroll.effective_from.desc()).limit(1)
    payroll_res = await db.execute(payroll_stmt)
    payroll_rec = payroll_res.scalars().first()
    latest_net_salary = float(payroll_rec.net_salary) if payroll_rec else 0.0
    
    # 4. Today Attendance
    att_stmt = select(Attendance).where(Attendance.employee_id == employee_id, Attendance.date == today)
    att_res = await db.execute(att_stmt)
    today_att_rec = att_res.scalars().first()
    
    today_attendance = None
    if today_att_rec:
        today_attendance = {
            "status": today_att_rec.status,
            "check_in": today_att_rec.check_in.strftime("%H:%M") if today_att_rec.check_in else None,
            "check_out": today_att_rec.check_out.strftime("%H:%M") if today_att_rec.check_out else None,
            "work_hours": f"{today_att_rec.work_hours}h" if today_att_rec.work_hours else "0h"
        }
        
    # Leave balance (annual paid-leave allowance minus committed paid days)
    from app.services import leave_service
    committed_paid = await leave_service.get_committed_paid_leave_days(db, employee_id, today.year)
    available_leaves = max(0, leave_service.ANNUAL_PAID_LEAVE_DAYS - committed_paid)

    # Notifications
    notif_stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(5)
    notif_res = await db.execute(notif_stmt)
    
    return {
        "attendance": {"present_days": present_days, "absent_days": absent_days},
        "leave": {"pending_requests": pending_requests, "available_leaves": available_leaves},
        "payroll": {"latest_net_salary": latest_net_salary},
        "today_attendance": today_attendance,
        "recent_activity": [],
        "recent_notifications": notif_res.scalars().all()
    }
