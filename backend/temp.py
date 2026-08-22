import asyncio
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.models.attendance import Attendance

async def run():
    db = AsyncSessionLocal()
    await db.execute(delete(Attendance))
    await db.commit()
    await db.close()
    print('Cleared Attendances')

asyncio.run(run())
