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
async def test_payroll_endpoints():
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
            "first_name": "Pay",
            "last_name": "Roll",
            "employee_code": f"E{str(uuid.uuid4())[:6]}",
            "email": new_emp_email,
            "password": "pwd"
        }
        resp = await client.post("/api/employees", json=emp_data, headers=headers_admin)
        emp_id = resp.json()["id"]
        
        # Login standard user
        resp = await client.post("/api/auth/login", data={"username": new_emp_email, "password": "pwd"})
        headers_new = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # 1. Admin generates payroll
        payroll_req = {
            "employee_id": emp_id,
            "effective_from": "2026-09-01",
            "basic_salary": "5000.00",
            "deductions": "250.00",
            "allowances": "100.25"
        }
        # Expected Net Salary: 5000 + 100.25 - 250 = 4850.25
        
        # Employee attempts to generate (should 403)
        resp = await client.post("/api/payroll", json=payroll_req, headers=headers_new)
        assert resp.status_code == 403
        
        # Admin successfully generates
        resp = await client.post("/api/payroll", json=payroll_req, headers=headers_admin)
        assert resp.status_code == 201
        assert float(resp.json()["net_salary"]) == 4850.25
        
        # Admin double-generates (should 400)
        resp = await client.post("/api/payroll", json=payroll_req, headers=headers_admin)
        assert resp.status_code == 400
        
        # 2. Employee checks own payroll
        resp = await client.get("/api/payroll/me", headers=headers_new)
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert float(resp.json()[0]["net_salary"]) == 4850.25
        
        # 3. Admin fetches all payrolls
        resp = await client.get("/api/payroll", headers=headers_admin)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
