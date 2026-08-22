import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.services.leave_service import get_employee_leaves
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as db:
        user = await db.execute(select(User).where(User.email == "test.employee@dayflow.com"))
        user = user.scalars().first()
        
        leaves = await get_employee_leaves(db, user.employee_id)
        from app.schemas.leave import LeaveResponse
        for l in leaves:
            res = LeaveResponse.model_validate(l)
            print("OK.")
        
        print(f"Fetched {len(leaves)} leaves.")

asyncio.run(run())
