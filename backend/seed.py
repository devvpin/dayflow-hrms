import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User, Role
from app.models.employee import Employee
from app.utils.security import get_password_hash
from sqlalchemy.future import select

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
                print("Generated missing Employee Profile for existing Admin.")

if __name__ == "__main__":
    asyncio.run(seed())
