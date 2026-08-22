import asyncio
from datetime import date
from app.core.database import AsyncSessionLocal
from app.models.user import User, Role
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.utils.security import get_password_hash
from sqlalchemy.future import select

ADMIN_PAYROLL_EFFECTIVE_FROM = date(2026, 8, 1)
ADMIN_BASIC_SALARY = 8500
ADMIN_ALLOWANCES = 1200
ADMIN_DEDUCTIONS = 450

async def ensure_admin_payroll(db, employee_id: int):
    result = await db.execute(
        select(Payroll).filter(
            Payroll.employee_id == employee_id,
            Payroll.effective_from == ADMIN_PAYROLL_EFFECTIVE_FROM
        )
    )
    if result.scalars().first():
        return False

    payroll = Payroll(
        employee_id=employee_id,
        basic_salary=ADMIN_BASIC_SALARY,
        allowances=ADMIN_ALLOWANCES,
        deductions=ADMIN_DEDUCTIONS,
        net_salary=ADMIN_BASIC_SALARY + ADMIN_ALLOWANCES - ADMIN_DEDUCTIONS,
        effective_from=ADMIN_PAYROLL_EFFECTIVE_FROM
    )
    db.add(payroll)
    await db.commit()
    return True

async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).filter(User.email == "admin@dayflow.com"))
        admin = result.scalars().first()
        
        if not admin:
            admin = User(
                email="admin@dayflow.com",
                password_hash=get_password_hash("admin"),
                role=Role.ADMIN,
                is_active=True
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            
            emp = Employee(
                user_id=admin.id,
                first_name="System",
                last_name="Administrator",
                employee_code="ADM-001",
                department="Management",
                designation="Director"
            )
            db.add(emp)
            await db.commit()
            await db.refresh(emp)
            print("Successfully created standard Admin user & linked their Employee Profile!")
        else:
            print("Admin user already exists. Overriding password to 'admin'")
            admin.password_hash = get_password_hash("admin")
            db.add(admin)
            await db.commit()
            
            result = await db.execute(select(Employee).filter(Employee.user_id == admin.id))
            emp = result.scalars().first()
            if not emp:
                emp = Employee(
                    user_id=admin.id,
                    first_name="System",
                    last_name="Administrator",
                    employee_code="ADM-001",
                    department="Management",
                    designation="Director"
                )
                db.add(emp)
                await db.commit()
                await db.refresh(emp)
                print("Generated missing Employee Profile for existing Admin.")

        payroll_created = await ensure_admin_payroll(db, emp.id)
        if payroll_created:
            print("Created payroll entry for Admin.")
        else:
            print("Admin payroll entry already exists.")

if __name__ == "__main__":
    asyncio.run(seed())
