import asyncio
import asyncpg
from app.core.config import settings

async def drop_all():
    conn = await asyncpg.connect(user="postgres", password="postgres", database="dayflow", host="localhost")
    await conn.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    await conn.close()
    print("Dropped public schema")

asyncio.run(drop_all())
