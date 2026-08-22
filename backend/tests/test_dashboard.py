import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from app.main import app
from app.models.user import Role
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.database import AsyncSessionLocal

async def setup_org():
    admin_email = f"admin_{uuid.uuid4()}@example.com"
    emp_email = f"emp_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    
    async with AsyncSessionLocal() as db:
        admin_obj = await create_user(db, UserCreate(email=admin_email, password=pwd))
        admin_obj.role = Role.ADMIN
        db.add(admin_obj)
        
        emp_obj = await create_user(db, UserCreate(email=emp_email, password=pwd))
        emp_obj.role = Role.EMPLOYEE
        db.add(emp_obj)
        await db.commit()
        
    return (admin_email, pwd), (emp_email, pwd)

@pytest.mark.anyio
async def test_dashboard_endpoints():
    creds_admin, creds_emp = await setup_org()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Auth Headers
        resp = await client.post("/api/auth/login", data={"username": creds_admin[0], "password": creds_admin[1]})
        headers_admin = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        resp = await client.post("/api/auth/login", data={"username": creds_emp[0], "password": creds_emp[1]})
        headers_emp = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # Admin creates employee profile for emp
        new_emp_email = f"new_{uuid.uuid4()}@example.com"
        emp_data = {
            "first_name": "Dash",
            "last_name": "Board",
            "employee_code": f"E{str(uuid.uuid4())[:6]}",
            "email": new_emp_email,
            "password": "pwd"
        }
        resp = await client.post("/api/employees", json=emp_data, headers=headers_admin)
        emp_id = resp.json()["id"]
        
        # 1. Admin Dashboard returns stats
        resp = await client.get("/api/dashboard/admin", headers=headers_admin)
        assert resp.status_code == 200
        stats = resp.json()
        assert stats["total_employees"] >= 1
        assert "attendance_today" in stats
        
        # 2. Emloyee tries to access Admin Dashboard (403 expected)
        resp = await client.get("/api/dashboard/admin", headers=headers_emp)
        assert resp.status_code == 403
        
        # 3. New employee checks their own dashboard
        resp = await client.post("/api/auth/login", data={"username": new_emp_email, "password": "pwd"})
        new_token = resp.json()["access_token"]
        
        resp = await client.get("/api/dashboard/me", headers={"Authorization": f"Bearer {new_token}"})
        assert resp.status_code == 200
        emp_stats = resp.json()
        assert emp_stats["checked_in_today"] is False
