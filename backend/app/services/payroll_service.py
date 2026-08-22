from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from typing import Sequence
from app.models.payroll import Payroll
from app.schemas.payroll import PayrollCreate, PayrollUpdate

async def create_payroll(db: AsyncSession, payroll_in: PayrollCreate) -> Payroll:
    net_salary = payroll_in.basic_salary + payroll_in.allowances - payroll_in.deductions
    
    stmt = select(Payroll).where(
        Payroll.employee_id == payroll_in.employee_id,
        Payroll.effective_from == payroll_in.effective_from
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Payroll already generated for this date")
        
    new_payroll = Payroll(
        employee_id=payroll_in.employee_id,
        effective_from=payroll_in.effective_from,
        basic_salary=payroll_in.basic_salary,
        deductions=payroll_in.deductions,
        allowances=payroll_in.allowances,
        net_salary=net_salary
    )
    db.add(new_payroll)
    await db.commit()
    
    # Reload with selectinload to satisfy Pydantic nested models mapping without MissingGreenlet error
    result = await db.execute(
        select(Payroll)
        .options(selectinload(Payroll.employee))
        .where(Payroll.id == new_payroll.id)
    )
    return result.scalars().first()

async def get_employee_payroll(db: AsyncSession, employee_id: int) -> Sequence[Payroll]:
    stmt = select(Payroll).options(selectinload(Payroll.employee)).where(Payroll.employee_id == employee_id).order_by(Payroll.effective_from.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_payrolls(db: AsyncSession) -> Sequence[Payroll]:
    stmt = select(Payroll).options(selectinload(Payroll.employee)).order_by(Payroll.effective_from.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_payroll(db: AsyncSession, payroll_id: int, payroll_in: PayrollUpdate) -> Payroll:
    result = await db.execute(select(Payroll).options(selectinload(Payroll.employee)).where(Payroll.id == payroll_id))
    payroll = result.scalars().first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    update_data = payroll_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payroll, field, value)
    
    # Recalculate net salary
    payroll.net_salary = payroll.basic_salary + payroll.allowances - payroll.deductions
    db.add(payroll)
    await db.commit()
    await db.refresh(payroll)
    return payroll
