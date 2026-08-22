from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from typing import Sequence
from app.models.payroll import Payroll
from app.schemas.payroll import PayrollCreate

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
    await db.refresh(new_payroll)
    return new_payroll

async def get_employee_payroll(db: AsyncSession, employee_id: int) -> Sequence[Payroll]:
    stmt = select(Payroll).where(Payroll.employee_id == employee_id).order_by(Payroll.effective_from.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_payrolls(db: AsyncSession) -> Sequence[Payroll]:
    stmt = select(Payroll).order_by(Payroll.effective_from.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
