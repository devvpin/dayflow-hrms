from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.payroll import PayrollCreate, PayrollResponse, PayrollUpdate
from app.services import payroll_service
from app.routers.attendance import get_current_employee_id

router = APIRouter()

@router.post("", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
async def generate_payroll(
    payroll_in: PayrollCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await payroll_service.create_payroll(db, payroll_in)

@router.get("/me", response_model=List[PayrollResponse])
async def read_my_payroll(
    employee_id: int = Depends(get_current_employee_id),
    db: AsyncSession = Depends(get_db)
):
    return await payroll_service.get_employee_payroll(db, employee_id)

@router.get("", response_model=List[PayrollResponse])
async def read_all_payrolls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await payroll_service.get_all_payrolls(db)

@router.put("/{payroll_id}", response_model=PayrollResponse)
async def update_payroll(
    payroll_id: int,
    payroll_in: PayrollUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await payroll_service.update_payroll(db, payroll_id, payroll_in)
