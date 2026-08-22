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
async def test_attendance_endpoints():
    creds_admin, creds_emp = await setup_org()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Auth Headers
        resp = await client.post("/api/auth/login", data={"username": creds_admin[0], "password": creds_admin[1]})
        headers_admin = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        resp = await client.post("/api/auth/login", data={"username": creds_emp[0], "password": creds_emp[1]})
        headers_emp = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # Admin creates employee first to get employee_id
        new_emp_email = f"new_{uuid.uuid4()}@example.com"
        emp_data = {
            "first_name": "Johnny",
            "last_name": "Punch",
            "employee_code": f"E{str(uuid.uuid4())[:6]}",
            "email": new_emp_email,
            "password": "pwd"
        }
        resp = await client.post("/api/employees", json=emp_data, headers=headers_admin)
        emp_id = resp.json()["id"]
        
        # New Employee Login
        resp = await client.post("/api/auth/login", data={"username": new_emp_email, "password": "pwd"})
        new_token = resp.json()["access_token"]
        headers_new = {"Authorization": f"Bearer {new_token}"}
        
        # 1. Check-in
        resp = await client.post("/api/attendance/check-in", headers=headers_new)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Present"
        assert resp.json()["check_in"] is not None
        
        # 2. Duplicate Check-in (should fail)
        resp = await client.post("/api/attendance/check-in", headers=headers_new)
        assert resp.status_code == 400
        
        # 3. Check-out
        resp = await client.post("/api/attendance/check-out", headers=headers_new)
        assert resp.status_code == 200
        assert resp.json()["check_out"] is not None
        assert resp.json()["work_hours"] >= 0
        
        # 4. Duplicate Check-out (should fail)
        resp = await client.post("/api/attendance/check-out", headers=headers_new)
        assert resp.status_code == 400
        
        # 5. Fetch own attendance
        resp = await client.get("/api/attendance/me", headers=headers_new)
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        
        # 6. Admin fetches all attendance
        resp = await client.get("/api/attendance", headers=headers_admin)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
