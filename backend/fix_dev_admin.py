import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, Role
from app.utils.security import get_password_hash

async def run():
    async with AsyncSessionLocal() as db:
        email = "devvpatel1311@gmail.com"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            user.role = Role.ADMIN
            user.is_active = True
            user.password_hash = get_password_hash("password123")
            db.add(user)
            await db.commit()
            print(f"Updated {email} to ADMIN with password 'password123'")
        else:
            print(f"User {email} not found")

asyncio.run(run())
