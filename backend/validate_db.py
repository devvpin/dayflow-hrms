import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.attendance import Attendance

async def run():
    async with AsyncSessionLocal() as db:
        users = await db.execute(select(User))
        for u in users.scalars().all():
            print(f"User: {u.email} | Active: {u.is_active} | Role: {u.role}")

        att = await db.execute(select(Attendance))
        print(f"Total Attendances: {len(att.scalars().all())}")

asyncio.run(run())
