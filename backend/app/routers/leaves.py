from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.leave import LeaveCreate, LeaveResponse, LeaveStatusUpdate
from app.services import leave_service
from app.routers.attendance import get_current_employee_id

router = APIRouter()

@router.post("", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
async def create_leave(
    leave_in: LeaveCreate,
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await leave_service.create_leave_request(db, employee_id, leave_in)

@router.get("/me", response_model=List[LeaveResponse])
async def read_my_leaves(
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await leave_service.get_employee_leaves(db, employee_id)

@router.get("", response_model=List[LeaveResponse])
async def read_all_leaves(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await leave_service.get_all_leaves(db)

@router.put("/{leave_id}/status", response_model=LeaveResponse)
async def update_leave_status(
    leave_id: int,
    status_in: LeaveStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await leave_service.update_leave_status(db, leave_id, status_in)
