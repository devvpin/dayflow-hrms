from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.models.payroll import Payroll
from app.dependencies.permissions import require_admin_or_hr
import io
import csv

router = APIRouter()

@router.get("/export/{type_name}")
async def export_report(
    type_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    output = io.StringIO()
    writer = csv.writer(output)
    
    if type_name == "attendance":
        writer.writerow(["ID", "Employee ID", "Date", "Check In", "Check Out", "Status", "Work Hours"])
        res = await db.execute(select(Attendance).order_by(Attendance.date.desc()))
        for rec in res.scalars().all():
            writer.writerow([
                rec.id, rec.employee_id, rec.date, 
                rec.check_in.strftime("%H:%M") if rec.check_in else "", 
                rec.check_out.strftime("%H:%M") if rec.check_out else "", 
                rec.status, rec.work_hours
            ])
        filename = "attendance_report.csv"
        
    elif type_name == "leaves":
        writer.writerow(["ID", "Employee ID", "Type", "Start Date", "End Date", "Status", "Reason"])
        res = await db.execute(select(LeaveRequest).order_by(LeaveRequest.start_date.desc()))
        for rec in res.scalars().all():
            writer.writerow([
                rec.id, rec.employee_id, rec.leave_type.value, 
                rec.start_date, rec.end_date, rec.status.value, rec.reason
            ])
        filename = "leave_report.csv"
        
    elif type_name == "payroll":
        writer.writerow(["ID", "Employee ID", "Basic Salary", "Allowances", "Deductions", "Net Salary"])
        res = await db.execute(select(Payroll))
        for rec in res.scalars().all():
            writer.writerow([rec.id, rec.employee_id, rec.basic_salary, rec.allowances, rec.deductions, rec.net_salary])
        filename = "payroll_report.csv"
        
    else:
        raise HTTPException(status_code=400, detail="Invalid export type requested")
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
