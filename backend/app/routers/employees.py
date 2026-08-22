from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.employee import EmployeeResponse, EmployeeCreate, EmployeeUpdateMe, EmployeeUpdateAdmin
from app.services import employee_service

router = APIRouter()

@router.get("/me", response_model=EmployeeResponse)
async def read_employee_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    employee = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return employee

@router.put("/me", response_model=EmployeeResponse)
async def update_employee_me(
    emp_in: EmployeeUpdateMe,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    employee = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return await employee_service.update_employee(db, employee, emp_in)

@router.get("", response_model=List[EmployeeResponse])
async def read_all_employees(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await employee_service.get_all_employees(db)

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_new_employee(
    emp_in: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await employee_service.create_employee(db, emp_in)

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def read_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    employee = await employee_service.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    emp_in: EmployeeUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    employee = await employee_service.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return await employee_service.update_employee(db, employee, emp_in)
