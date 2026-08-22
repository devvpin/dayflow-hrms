from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import Sequence, Optional
from datetime import datetime, date, timezone
from app.models.attendance import Attendance

async def get_attendance_record(db: AsyncSession, employee_id: int, target_date: date) -> Attendance | None:
    stmt = select(Attendance).where(Attendance.employee_id == employee_id, Attendance.date == target_date)
    result = await db.execute(stmt)
    return result.scalars().first()

async def check_in(db: AsyncSession, employee_id: int) -> Attendance:
    today = datetime.now(timezone.utc).date()
    existing = await get_attendance_record(db, employee_id, today)
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in for today")
    
    new_record = Attendance(
        employee_id=employee_id,
        date=today,
        check_in=datetime.now(timezone.utc),
        status="Present"
    )
    db.add(new_record)
    await db.commit()
    
    result = await db.execute(
        select(Attendance).options(selectinload(Attendance.employee)).where(Attendance.id == new_record.id)
    )
    return result.scalars().first()

async def check_out(db: AsyncSession, employee_id: int) -> Attendance:
    today = datetime.now(timezone.utc).date()
    record = await get_attendance_record(db, employee_id, today)
    
    if not record:
        raise HTTPException(status_code=400, detail="Cannot check out without checking in")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out for today")
        
    out_time = datetime.now(timezone.utc)
    record.check_out = out_time
    
    delta = out_time - record.check_in
    record.work_hours = round(delta.total_seconds() / 3600.0, 2)
    
    db.add(record)
    await db.commit()
    
    result = await db.execute(
        select(Attendance).options(selectinload(Attendance.employee)).where(Attendance.id == record.id)
    )
    return result.scalars().first()

async def get_my_attendance(db: AsyncSession, employee_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Sequence[Attendance]:
    stmt = select(Attendance).options(selectinload(Attendance.employee)).where(Attendance.employee_id == employee_id)
    if start_date:
        stmt = stmt.where(Attendance.date >= start_date)
    if end_date:
        stmt = stmt.where(Attendance.date <= end_date)
    stmt = stmt.order_by(Attendance.date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_attendance(db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Sequence[Attendance]:
    stmt = select(Attendance).options(selectinload(Attendance.employee))
    if start_date:
        stmt = stmt.where(Attendance.date >= start_date)
    if end_date:
        stmt = stmt.where(Attendance.date <= end_date)
    stmt = stmt.order_by(Attendance.date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
