import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from app.main import app
from app.models.user import Role
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.database import AsyncSessionLocal

async def setup_users():
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
async def test_employee_management():
    creds_admin, creds_emp = await setup_users()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Auth Headers
        resp = await client.post("/api/auth/login", data={"username": creds_admin[0], "password": creds_admin[1]})
        headers_admin = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        resp = await client.post("/api/auth/login", data={"username": creds_emp[0], "password": creds_emp[1]})
        headers_emp = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # 1. Admin creates employee
        new_emp_email = f"new_{uuid.uuid4()}@example.com"
        emp_data = {
            "first_name": "John",
            "last_name": "Doe",
            "employee_code": f"E{str(uuid.uuid4())[:4]}",
            "email": new_emp_email,
            "password": "pwd"
        }
        resp = await client.post("/api/employees", json=emp_data, headers=headers_admin)
        assert resp.status_code == 201
        emp_id = resp.json()["id"]
        
        # 2. Employee tries to create employee (Should be 403)
        resp = await client.post("/api/employees", json=emp_data, headers=headers_emp)
        assert resp.status_code == 403
        
        # 3. New Employee hits /me
        resp = await client.post("/api/auth/login", data={"username": new_emp_email, "password": "pwd"})
        new_token = resp.json()["access_token"]
        resp = await client.get("/api/employees/me", headers={"Authorization": f"Bearer {new_token}"})
        assert resp.status_code == 200
        assert resp.json()["first_name"] == "John"
        
        # 4. New Employee tries to modify restricted fields via /me
        update_data = {"phone": "12345", "department": "CEO"}
        resp = await client.put("/api/employees/me", json=update_data, headers={"Authorization": f"Bearer {new_token}"})
        assert resp.status_code == 200
        assert resp.json()["phone"] == "12345"
        assert resp.json()["department"] != "CEO"
        
        # 5. Admin updates the new employee
        update_admin_data = {"department": "Engineering"}
        resp = await client.put(f"/api/employees/{emp_id}", json=update_admin_data, headers=headers_admin)
        assert resp.status_code == 200
        assert resp.json()["department"] == "Engineering"
