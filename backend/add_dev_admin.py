import asyncio
import os
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, Role
from app.models.employee import Employee
from app.utils.security import get_password_hash

async def run():
    async with AsyncSessionLocal() as db:
        # Check if user already exists
        email = "devvpatel1311@gmail.com"
        result = await db.execute(select(User).where(User.email == email))
        if result.scalars().first():
            print(f"User {email} already exists.")
            return

        # Create Admin User
        admin_user = User(
            email=email,
            password_hash=get_password_hash("password123"),
            role=Role.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        
        # Create Employee Profile for Admin User
        admin_emp = Employee(
            employee_code="DEV-001",
            first_name="Dev",
            last_name="Patel",
            user_id=admin_user.id,
            department="Management",
            designation="Hackathon Presenter",
            phone="555-0000",
            address="Hackathon Floor"
        )
        db.add(admin_emp)
        await db.commit()
        await db.refresh(admin_emp)
        
        # Link user to employee profile
        admin_user.employee_id = admin_emp.id
        db.add(admin_user)
        await db.commit()
        
        print(f"Successfully added {email} as an ADMIN employee.")

asyncio.run(run())
