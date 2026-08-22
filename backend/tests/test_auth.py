import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.anyio
async def test_register_and_login(async_client: AsyncClient):
    # Use random email to avoid state conflict if DB is not completely dropped
    email = f"test_{uuid.uuid4()}@example.com"
    password = "secretpassword"
    
    # 1. Register User
    resp = await async_client.post("/api/auth/register", json={"email": email, "password": password})
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == email

    # 2. Duplicate Check
    resp = await async_client.post("/api/auth/register", json={"email": email, "password": password})
    assert resp.status_code == 400

    # 3. Valid Login
    resp = await async_client.post("/api/auth/login", data={"username": email, "password": password})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    assert token is not None

    # 4. JWT Me Check
    resp = await async_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == email

    # 5. Invalid Login Error Handling
    resp = await async_client.post("/api/auth/login", data={"username": email, "password": "wrongpassword"})
    assert resp.status_code == 401

    # 6. Invalid JWT Header Token
    resp = await async_client.get("/api/auth/me", headers={"Authorization": f"Bearer invalid_token_123"})
    assert resp.status_code == 401
