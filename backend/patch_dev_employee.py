import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.employee import Employee
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as db:
        email = "devvpatel1311@gmail.com"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if user and not user.employee_id:
            emp = Employee(
                employee_code="DEV-001",
                first_name="Dev",
                last_name="Patel",
                user_id=user.id,
                department="Management",
                designation="Hackathon Presenter",
                phone="555-0000",
                address="Hackathon HQ"
            )
            db.add(emp)
            await db.commit()
            await db.refresh(emp)
            
            user.employee_id = emp.id
            db.add(user)
            await db.commit()
            print("Successfully linked Employee profile to devvpatel.")
        elif user and user.employee_id:
            print("User already has an employee profile.")
        else:
            print("User not found.")

asyncio.run(run())
