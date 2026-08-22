import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from app.main import app
from app.models.user import Role
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.database import AsyncSessionLocal

async def setup_integration():
    admin_email = f"int_admin_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    
    async with AsyncSessionLocal() as db:
        admin_obj = await create_user(db, UserCreate(email=admin_email, password=pwd))
        admin_obj.role = Role.ADMIN
        db.add(admin_obj)
        await db.commit()
        
    return admin_email, pwd

@pytest.mark.anyio
async def test_full_integration_flow():
    admin_email, pwd = await setup_integration()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Admin Login
        resp = await client.post("/api/auth/login", data={"username": admin_email, "password": pwd})
        assert resp.status_code == 200
        admin_token = resp.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        
        # 2. Duplicate Login Testing Error Handlers directly
        resp = await client.post("/api/auth/register", json={"email": admin_email, "password": pwd})
        assert resp.status_code == 400 # Intercepted IntegrityError or standard validation
        
        # 3. Create Employee Profile
        emp_email = f"emp_int_{uuid.uuid4()}@example.com"
        emp_data = {
            "first_name": "Integration",
            "last_name": "Testing",
            "employee_code": f"E{str(uuid.uuid4())[:6]}",
            "email": emp_email,
            "password": "pwd"
        }
        resp = await client.post("/api/employees", json=emp_data, headers=headers_admin)
        assert resp.status_code == 201
        
        # 4. Employee Login
        resp = await client.post("/api/auth/login", data={"username": emp_email, "password": "pwd"})
        emp_token = resp.json()["access_token"]
        headers_emp = {"Authorization": f"Bearer {emp_token}"}
        
        # 5. Dashboard fetching isolated check
        resp = await client.get("/api/dashboard/admin", headers=headers_admin)
        assert resp.status_code == 200
        assert resp.json()["total_employees"] > 0
        
        resp = await client.get("/api/dashboard/me", headers=headers_emp)
        assert resp.status_code == 200
