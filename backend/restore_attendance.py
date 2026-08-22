import asyncio
from datetime import datetime
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.user import User

async def run():
    async with AsyncSessionLocal() as db:
        # Get all employees
        result = await db.execute(select(Employee))
        employees = result.scalars().all()
        
        today = datetime.today().date()
        
        for emp in employees:
            # Check if attendance exists for today
            res = await db.execute(select(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == today))
            if not res.scalars().first():
                # Present today
                check_in_time = datetime.now().replace(hour=9, minute=0, second=0)
                check_out_time = datetime.now().replace(hour=17, minute=0, second=0)
                
                att = Attendance(
                    employee_id=emp.id,
                    date=today,
                    check_in=check_in_time,
                    check_out=check_out_time,
                    status="Present",
                    work_hours=8.00
                )
                db.add(att)
        
        await db.commit()
        print("Restored ALL employee attendances for today.")

        # ALSO fix the active status toggle
        # The user said "if i change actvie to deactive it doesnt reflect"
        # We need to allow EmployeeUpdateAdmin to accept `is_active`

asyncio.run(run())
