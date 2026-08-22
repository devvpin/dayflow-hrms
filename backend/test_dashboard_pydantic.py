import asyncio
from app.core.database import AsyncSessionLocal
from app.services.dashboard_service import get_admin_dashboard_stats
from app.schemas.dashboard import AdminDashboardResponse
from pydantic import ValidationError

async def run():
    async with AsyncSessionLocal() as db:
        stats = await get_admin_dashboard_stats(db)
        try:
            res = AdminDashboardResponse(**stats)
            print("Validation successful!")
        except Exception as e:
            print(f"Validation Error: {e}")

asyncio.run(run())
