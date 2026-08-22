import asyncio
from app.core.database import AsyncSessionLocal
from app.services.dashboard_service import get_employee_dashboard_stats
from app.models.user import User, Role
from app.models.employee import Employee
from app.utils.security import get_password_hash
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as db:
        # 1. ADD NORMAL EMPLOYEE
        email = "test.employee@dayflow.com"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            emp_user = User(
                email=email,
                password_hash=get_password_hash("password123"),
                role=Role.EMPLOYEE,
                is_active=True
            )
            db.add(emp_user)
            await db.commit()
            await db.refresh(emp_user)
            
            emp_profile = Employee(
                employee_code="TEST-002",
                first_name="Test",
                last_name="Employee",
                user_id=emp_user.id,
                department="Engineering",
                designation="Tester",
                phone="555-1234",
                address="Remote"
            )
            db.add(emp_profile)
            await db.commit()
            await db.refresh(emp_profile)
            
            emp_user.employee_id = emp_profile.id
            db.add(emp_user)
            await db.commit()
            print(f"Added normal employee: {email} / password123")
        else:
            print(f"Normal employee {email} already exists.")

        # 2. TEST DASHBOARD CRASH FOR devvpatel
        dev_res = await db.execute(select(User).where(User.email == "devvpatel1311@gmail.com"))
        dev_user = dev_res.scalars().first()
        if dev_user and dev_user.employee_id:
            try:
                stats = await get_employee_dashboard_stats(db, dev_user.employee_id, dev_user.id)
                print("Devv Dashboard Stats (Employee View):", stats)
                
                # Check Pydantic
                from app.schemas.dashboard import EmployeeDashboardResponse
                EmployeeDashboardResponse(**stats)
                print("Pydantic EmployeeDashboardResponse Validation Successful!")
            except Exception as e:
                print(f"ERROR ON DEV DASHBOARD: {e}")
                import traceback
                traceback.print_exc()

asyncio.run(run())
