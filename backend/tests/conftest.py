import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
async def _reset_engine_pool():
    # Each test runs on its own event loop. asyncpg binds every connection to the
    # loop that created it, so a connection left in the pool by a previous test
    # raises "another operation is in progress" when a later test's loop tries to
    # reuse it. Disposing the engine after each test empties the pool, so every
    # test opens fresh connections on its own loop.
    yield
    await engine.dispose()


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
