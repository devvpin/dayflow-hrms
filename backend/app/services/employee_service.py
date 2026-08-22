from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from fastapi import HTTPException
from typing import Sequence
from app.models.employee import Employee
from app.models.user import User
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.models.payroll import Payroll
from app.models.notification import Notification
from app.schemas.employee import EmployeeCreate, EmployeeUpdateAdmin, EmployeeUpdateMe
from app.utils.security import get_password_hash

async def get_all_employees(db: AsyncSession) -> Sequence[Employee]:
    result = await db.execute(select(Employee))
    return result.scalars().all()

async def get_employee_by_id(db: AsyncSession, employee_id: int) -> Employee | None:
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    return result.scalars().first()

async def get_employee_by_user_id(db: AsyncSession, user_id: int) -> Employee | None:
    result = await db.execute(select(Employee).where(Employee.user_id == user_id))
    return result.scalars().first()

async def create_employee(db: AsyncSession, emp_in: EmployeeCreate) -> Employee:
    result = await db.execute(select(User).where(User.email == emp_in.email))
    if result.scalars().first():
         raise HTTPException(status_code=400, detail="Email already registered")
    
    result = await db.execute(select(Employee).where(Employee.employee_code == emp_in.employee_code))
    if result.scalars().first():
         raise HTTPException(status_code=400, detail="Employee code already taken")
         
    new_user = User(
        email=emp_in.email,
        password_hash=get_password_hash(emp_in.password),
        role=emp_in.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    new_employee = Employee(
        employee_code=emp_in.employee_code,
        first_name=emp_in.first_name,
        last_name=emp_in.last_name,
        user_id=new_user.id,
        department=emp_in.department,
        designation=emp_in.designation,
        phone=emp_in.phone,
        address=emp_in.address,
        profile_picture=emp_in.profile_picture
    )
    db.add(new_employee)
    await db.commit()
    await db.refresh(new_employee)
    
    new_user.employee_id = new_employee.id
    await db.commit()
    
    return new_employee

async def update_employee(db: AsyncSession, db_obj: Employee, obj_in: EmployeeUpdateAdmin | EmployeeUpdateMe) -> Employee:
    update_data = obj_in.model_dump(exclude_unset=True)
    
    if "is_active" in update_data:
        is_active = update_data.pop("is_active")
        user = await db.execute(select(User).where(User.id == db_obj.user_id))
        user_db = user.scalars().first()
        if user_db:
            user_db.is_active = is_active
            db.add(user_db)

    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_employee(db: AsyncSession, employee_id: int) -> bool:
    employee = await get_employee_by_id(db, employee_id)
    if not employee:
        return False
        
    # Perform manual cascade delete to prevent IntegrityError
    await db.execute(delete(Attendance).where(Attendance.employee_id == employee_id))
    await db.execute(delete(LeaveRequest).where(LeaveRequest.employee_id == employee_id))
    await db.execute(delete(Payroll).where(Payroll.employee_id == employee_id))
        
    user = await db.execute(select(User).where(User.employee_id == employee_id))
    user = user.scalars().first()
    
    if user:
        await db.execute(delete(Notification).where(Notification.user_id == user.id))
        user.employee_id = None
        employee.user_id = None
        await db.commit()
        await db.delete(user)
        
    await db.delete(employee)
    await db.commit()
    return True
