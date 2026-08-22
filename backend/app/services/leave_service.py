from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from typing import Sequence
from app.models.leave import LeaveRequest, LeaveStatus
from app.schemas.leave import LeaveCreate, LeaveStatusUpdate

async def create_leave_request(db: AsyncSession, employee_id: int, leave_in: LeaveCreate) -> LeaveRequest:
    if leave_in.start_date > leave_in.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")
        
    new_leave = LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        status=LeaveStatus.PENDING
    )
    db.add(new_leave)
    await db.commit()
    await db.refresh(new_leave)
    return new_leave

async def get_employee_leaves(db: AsyncSession, employee_id: int) -> Sequence[LeaveRequest]:
    stmt = select(LeaveRequest).where(LeaveRequest.employee_id == employee_id).order_by(LeaveRequest.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_leaves(db: AsyncSession) -> Sequence[LeaveRequest]:
    stmt = select(LeaveRequest).order_by(LeaveRequest.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_leave_status(db: AsyncSession, leave_id: int, status_in: LeaveStatusUpdate) -> LeaveRequest:
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == leave_id))
    leave = result.scalars().first()
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = status_in.status
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return leave
