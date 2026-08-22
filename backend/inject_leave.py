import asyncio
from datetime import date, timedelta
from app.core.database import AsyncSessionLocal
from app.models.leave import LeaveRequest, LeaveType, LeaveStatus

async def inject_pending_leave():
    async with AsyncSessionLocal() as db:
        today = date.today()
        leave = LeaveRequest(
            employee_id=1,  # Assuming System Administrator is ID 1 (based on previous seeds)
            leave_type=LeaveType.SICK,
            start_date=today + timedelta(days=20),
            end_date=today + timedelta(days=21),
            reason="Medical checkup and flu.",
            status=LeaveStatus.PENDING
        )
        db.add(leave)
        await db.commit()
        print("Successfully injected PENDING leave.")

asyncio.run(inject_pending_leave())
