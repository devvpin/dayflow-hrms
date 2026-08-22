import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.main import app
from app.dependencies.permissions import require_admin, require_hr, require_admin_or_hr, require_employee
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.database import AsyncSessionLocal
from app.models.user import Role, User

# Add dummy routes to test permissions
@app.get("/api/test/admin", dependencies=[Depends(require_admin)])
def dummy_admin(): return {"status": "ok"}

@app.get("/api/test/hr", dependencies=[Depends(require_hr)])
def dummy_hr(): return {"status": "ok"}

@app.get("/api/test/admin_or_hr", dependencies=[Depends(require_admin_or_hr)])
def dummy_admin_hr(): return {"status": "ok"}

@app.get("/api/test/employee", dependencies=[Depends(require_employee)])
def dummy_employee(): return {"status": "ok"}

async def create_user_with_role(role: Role) -> dict:
    email = f"test_{role.value}_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    
    async with AsyncSessionLocal() as db:
        user_in = UserCreate(email=email, password=pwd)
        db_user = await create_user(db, user_in)
        
        # Override role directly since register defaults to EMPLOYEE
        db_user.role = role
        db.add(db_user)
        await db.commit()
    
    return {"email": email, "password": pwd}

@pytest.mark.anyio
async def test_role_based_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        
        roles_to_test = [Role.ADMIN, Role.HR, Role.EMPLOYEE]
        tokens = {}
        
        # Generate users and login to get tokens
        for role in roles_to_test:
            creds = await create_user_with_role(role)
            resp = await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
            tokens[role] = resp.json()["access_token"]
        
        headers_admin = {"Authorization": f"Bearer {tokens[Role.ADMIN]}"}
        headers_hr = {"Authorization": f"Bearer {tokens[Role.HR]}"}
        headers_employee = {"Authorization": f"Bearer {tokens[Role.EMPLOYEE]}"}
        
        # Admin tests
        assert (await client.get("/api/test/admin", headers=headers_admin)).status_code == 200
        assert (await client.get("/api/test/admin", headers=headers_hr)).status_code == 403
        assert (await client.get("/api/test/admin", headers=headers_employee)).status_code == 403
        
        # HR tests
        assert (await client.get("/api/test/hr", headers=headers_admin)).status_code == 403
        assert (await client.get("/api/test/hr", headers=headers_hr)).status_code == 200
        assert (await client.get("/api/test/hr", headers=headers_employee)).status_code == 403
        
        # Admin or HR tests
        assert (await client.get("/api/test/admin_or_hr", headers=headers_admin)).status_code == 200
        assert (await client.get("/api/test/admin_or_hr", headers=headers_hr)).status_code == 200
        assert (await client.get("/api/test/admin_or_hr", headers=headers_employee)).status_code == 403
        
        # Employee tests
        assert (await client.get("/api/test/employee", headers=headers_admin)).status_code == 403
        assert (await client.get("/api/test/employee", headers=headers_hr)).status_code == 403
        assert (await client.get("/api/test/employee", headers=headers_employee)).status_code == 200
