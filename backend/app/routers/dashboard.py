from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.dashboard import AdminDashboardResponse, EmployeeDashboardResponse
from app.services import dashboard_service
from app.routers.attendance import get_current_employee_id

router = APIRouter()

@router.get("/admin", response_model=AdminDashboardResponse)
async def read_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await dashboard_service.get_admin_dashboard_stats(db)

@router.get("/me", response_model=EmployeeDashboardResponse)
async def read_my_dashboard(
    employee_id: int = Depends(get_current_employee_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await dashboard_service.get_employee_dashboard_stats(db, employee_id, current_user.id)
