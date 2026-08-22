import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from app.main import app
from app.models.user import Role
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.database import AsyncSessionLocal
from app.schemas.notification import NotificationCreate
from app.services.notification_service import create_notification

async def setup_org():
    emp_email = f"emp_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    
    async with AsyncSessionLocal() as db:
        emp_obj = await create_user(db, UserCreate(email=emp_email, password=pwd))
        emp_obj.role = Role.EMPLOYEE
        db.add(emp_obj)
        await db.commit()
        
        # Manually create a notification for them
        await create_notification(db, NotificationCreate(user_id=emp_obj.id, title="Test", message="Test Message"))
        
    return (emp_email, pwd)

@pytest.mark.anyio
async def test_notifications():
    creds_emp = await setup_org()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Auth Headers
        resp = await client.post("/api/auth/login", data={"username": creds_emp[0], "password": creds_emp[1]})
        headers_emp = {"Authorization": f"Bearer {resp.json()['access_token']}"}
        
        # 1. Fetch own notifications
        resp = await client.get("/api/notifications", headers=headers_emp)
        assert resp.status_code == 200
        notifications = resp.json()
        assert len(notifications) == 1
        notif_id = notifications[0]["id"]
        assert notifications[0]["is_read"] is False
        
        # 2. Mark as read
        resp = await client.put(f"/api/notifications/{notif_id}/read", headers=headers_emp)
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True
