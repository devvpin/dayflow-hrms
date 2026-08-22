import asyncio
from app.core.database import AsyncSessionLocal
from app.services.dashboard_service import get_admin_dashboard_stats

async def run():
    async with AsyncSessionLocal() as db:
        try:
            stats = await get_admin_dashboard_stats(db)
            print(stats)
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

asyncio.run(run())
