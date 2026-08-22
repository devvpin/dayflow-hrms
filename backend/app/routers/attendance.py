from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.attendance import AttendanceResponse
from app.services import attendance_service
from app.services.employee_service import get_employee_by_user_id

router = APIRouter()

async def get_current_employee_id(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> int:
    employee = await get_employee_by_user_id(db, current_user.id)
    if not employee:
        raise HTTPException(status_code=400, detail="Employee profile missing")
    return employee.id

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await attendance_service.check_in(db, employee_id)

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await attendance_service.check_out(db, employee_id)

@router.get("/me", response_model=List[AttendanceResponse])
async def read_my_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await attendance_service.get_my_attendance(db, employee_id, start_date, end_date)

@router.get("", response_model=List[AttendanceResponse])
async def read_all_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await attendance_service.get_all_attendance(db, start_date, end_date)

@router.get("/employee/{employee_target_id}", response_model=List[AttendanceResponse])
async def read_employee_attendance(
    employee_target_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await attendance_service.get_my_attendance(db, employee_target_id, start_date, end_date)
