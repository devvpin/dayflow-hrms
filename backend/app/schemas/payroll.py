from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import date
from app.schemas.employee import EmployeeResponse

class PayrollBase(BaseModel):
    employee_id: int
    effective_from: date
    basic_salary: Decimal
    deductions: Decimal = Decimal('0.0')
    allowances: Decimal = Decimal('0.0')

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    basic_salary: Optional[Decimal] = None
    allowances: Optional[Decimal] = None
    deductions: Optional[Decimal] = None

class PayrollResponse(PayrollBase):
    id: int
    net_salary: Decimal
    employee: Optional[EmployeeResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
