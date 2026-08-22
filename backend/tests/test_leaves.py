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
async def test_leaves_endpoints():
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
            "first_name": "Leave",
            "last_name": "Taker",
            "employee_code": f"E{str(uuid.uuid4())[:6]}",
            "email": new_emp_email,
            "password": "pwd"
        }
        await client.post("/api/employees", json=emp_data, headers=headers_admin)
        
        # Login standard user
        resp = await client.post("/api/auth/login", data={"username": new_emp_email, "password": "pwd"})
        headers_new = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # 1. New Employee Requests Leave
        leave_req = {
            "leave_type": "Sick Leave",
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "reason": "Flu"
        }
        resp = await client.post("/api/leaves", json=leave_req, headers=headers_new)
        assert resp.status_code == 201
        assert resp.json()["status"] == "Pending"
        leave_id = resp.json()["id"]
        
        # 2. Employee checks own leaves
        resp = await client.get("/api/leaves/me", headers=headers_new)
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        
        # 3. Employee tries to approve own leave (403 expected)
        resp = await client.put(f"/api/leaves/{leave_id}/status", json={"status": "Approved"}, headers=headers_new)
        assert resp.status_code == 403
        
        # 4. Admin checks all leaves
        resp = await client.get("/api/leaves", headers=headers_admin)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
        
        # 5. Admin approves leave
        resp = await client.put(f"/api/leaves/{leave_id}/status", json={"status": "Approved"}, headers=headers_admin)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Approved"
