import asyncio
from datetime import date, timedelta
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.schemas.leave import LeaveCreate
from app.services.leave_service import create_leave_request
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as db:
        user = await db.execute(select(User).where(User.email == "test.employee@dayflow.com"))
        user = user.scalars().first()
        
        if not user or not user.employee_id:
            print("Test user not ready")
            return
            
        leave_data = LeaveCreate(
            leave_type="PAID",
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=6),
            reason="Vacation test"
        )
        
        try:
            leave = await create_leave_request(db, user.employee_id, leave_data)
            print("Leave created:", leave)
            
            # test Pydantic
            from app.schemas.leave import LeaveResponse
            res = LeaveResponse.model_validate(leave)
            print("Pydantic valid:", res)
        except Exception as e:
            print(f"Exception creating leave: {e}")
            import traceback
            traceback.print_exc()

asyncio.run(run())
