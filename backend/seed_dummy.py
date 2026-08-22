import asyncio
from datetime import datetime, timedelta, date
from app.core.database import AsyncSessionLocal
from app.models.user import User, Role
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest, LeaveType, LeaveStatus
from app.models.payroll import Payroll
from app.models.notification import Notification
from sqlalchemy.future import select

async def seed():
    async with AsyncSessionLocal() as db:
        # Fetch the root Admin account
        result = await db.execute(select(User).filter(User.email == "admin@dayflow.com"))
        admin = result.scalars().first()
        if not admin:
            print("Root admin missing... Run seed.py first.")
            return

        result_emp = await db.execute(select(Employee).filter(Employee.user_id == admin.id))
        admin_emp = result_emp.scalars().first()
        if not admin_emp:
            print("Root admin Employee Profile missing... Run seed.py first.")
            return

        today = date.today()
        # Mock Attendance (Past 5 days check-ins and check-outs)
        statuses = ["Present", "Half Day", "Absent", "On Leave", "Present"]
        for i in range(1, 6):
            d = today - timedelta(days=i)
            res = await db.execute(select(Attendance).filter(Attendance.employee_id == admin_emp.id, Attendance.date == d))
            if not res.scalars().first():
                status = statuses[i-1]
                work_hours = 8.00 if status == "Present" else (4.00 if status == "Half Day" else 0.0)
                
                check_in_time = datetime.now().replace(year=d.year, month=d.month, day=d.day, hour=9, minute=0, second=0) if status != "Absent" and status != "On Leave" else None
                check_out_time = datetime.now().replace(year=d.year, month=d.month, day=d.day, hour=(17 if status == "Present" else 13), minute=0, second=0) if status != "Absent" and status != "On Leave" else None
                
                att = Attendance(
                    employee_id=admin_emp.id,
                    date=d,
                    check_in=check_in_time,
                    check_out=check_out_time,
                    status=status,
                    work_hours=work_hours
                )
                db.add(att)

        # Mock Leave Requests
        res_leaves = await db.execute(select(LeaveRequest).filter(LeaveRequest.employee_id == admin_emp.id))
        if not res_leaves.scalars().first():
            leave1 = LeaveRequest(
                employee_id=admin_emp.id,
                leave_type=LeaveType.PAID,
                start_date=today + timedelta(days=5),
                end_date=today + timedelta(days=7),
                reason="Attending a cousin's wedding.",
                status=LeaveStatus.APPROVED
            )
            leave2 = LeaveRequest(
                employee_id=admin_emp.id,
                leave_type=LeaveType.SICK,
                start_date=today - timedelta(days=14),
                end_date=today - timedelta(days=12),
                reason="Severe flu and fever.",
                status=LeaveStatus.APPROVED
            )
            db.add_all([leave1, leave2])

        # Mock Payroll Profile
        res_payroll = await db.execute(select(Payroll).filter(Payroll.employee_id == admin_emp.id))
        if not res_payroll.scalars().first():
            payroll = Payroll(
                employee_id=admin_emp.id,
                basic_salary=8500,
                allowances=1200,
                deductions=450,
                net_salary=9250,
                effective_from=date(2023, 1, 1)
            )
            db.add(payroll)

        # Mock Notifications
        res_notif = await db.execute(select(Notification).filter(Notification.user_id == admin.id))
        if len(res_notif.scalars().all()) < 2:
            n1 = Notification(
                user_id=admin.id,
                title="Welcome to Dayflow HRMS",
                message="Your admin profile has been fully set up with comprehensive dummy data. Test the UI!",
                is_read=False
            )
            n2 = Notification(
                user_id=admin.id,
                title="New Leave Request",
                message="An employee has submitted a new leave request pending your approval.",
                is_read=False
            )
            db.add_all([n1, n2])

        await db.commit()
        print("Successfully injected huge dummy dataset universally across Payroll, Attendance, Leaves, and Notifications.")

if __name__ == "__main__":
    asyncio.run(seed())
