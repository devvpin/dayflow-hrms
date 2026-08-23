from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from typing import Sequence
from sqlalchemy import func
from datetime import date
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.schemas.leave import LeaveCreate, LeaveStatusUpdate
from app.services import settings_service

ANNUAL_PAID_LEAVE_DAYS = 20


def _leave_days(start_date: date, end_date: date) -> int:
    """Inclusive number of calendar days a leave spans."""
    return (end_date - start_date).days + 1


async def get_committed_paid_leave_days(db: AsyncSession, employee_id: int, year: int) -> int:
    """Total PAID leave days already committed (pending or approved) in `year`."""
    stmt = select(LeaveRequest).where(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.leave_type == LeaveType.PAID,
        LeaveRequest.status != LeaveStatus.REJECTED,
        func.extract('year', LeaveRequest.start_date) == year,
    )
    result = await db.execute(stmt)
    return sum(_leave_days(lv.start_date, lv.end_date) for lv in result.scalars().all())

async def create_leave_request(db: AsyncSession, employee_id: int, leave_in: LeaveCreate) -> LeaveRequest:
    if leave_in.start_date > leave_in.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")

    # Reject requests that overlap an existing non-rejected leave.
    overlap_stmt = select(LeaveRequest).where(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status != LeaveStatus.REJECTED,
        LeaveRequest.start_date <= leave_in.end_date,
        LeaveRequest.end_date >= leave_in.start_date,
    )
    overlap_res = await db.execute(overlap_stmt)
    if overlap_res.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="You already have a leave request overlapping these dates",
        )

    # Enforce the annual paid-leave balance.
    if leave_in.leave_type == LeaveType.PAID:
        requested_days = _leave_days(leave_in.start_date, leave_in.end_date)
        committed = await get_committed_paid_leave_days(db, employee_id, leave_in.start_date.year)
        if committed + requested_days > ANNUAL_PAID_LEAVE_DAYS:
            remaining = ANNUAL_PAID_LEAVE_DAYS - committed
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient paid-leave balance: {remaining} day(s) remaining, {requested_days} requested",
            )
        
    # Auto-approve when the org has disabled leave approvals.
    settings = await settings_service.get_or_create_settings(db)
    initial_status = LeaveStatus.PENDING if settings.require_approval_for_leaves else LeaveStatus.APPROVED

    new_leave = LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        status=initial_status,
    )
    db.add(new_leave)
    await db.commit()
    
    # Reload with selectinload to satisfy Pydantic nested models mapping without MissingGreenlet error
    result = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.employee))
        .where(LeaveRequest.id == new_leave.id)
    )
    return result.scalars().first()

async def get_employee_leaves(db: AsyncSession, employee_id: int) -> Sequence[LeaveRequest]:
    stmt = select(LeaveRequest).options(selectinload(LeaveRequest.employee)).where(LeaveRequest.employee_id == employee_id).order_by(LeaveRequest.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_leaves(db: AsyncSession) -> Sequence[LeaveRequest]:
    stmt = select(LeaveRequest).options(selectinload(LeaveRequest.employee)).order_by(LeaveRequest.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_leave_status(db: AsyncSession, leave_id: int, status_in: LeaveStatusUpdate) -> LeaveRequest:
    result = await db.execute(select(LeaveRequest).options(selectinload(LeaveRequest.employee)).where(LeaveRequest.id == leave_id))
    leave = result.scalars().first()
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = status_in.status
    if status_in.admin_comment:
        leave.admin_comments = status_in.admin_comment
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return leave
