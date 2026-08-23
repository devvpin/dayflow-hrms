from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from decimal import Decimal
from datetime import date
from app.schemas.employee import EmployeeResponse

class PayrollBase(BaseModel):
    employee_id: int
    effective_from: date
    basic_salary: Decimal = Field(ge=0)
    deductions: Decimal = Field(default=Decimal('0.0'), ge=0)
    allowances: Decimal = Field(default=Decimal('0.0'), ge=0)

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    basic_salary: Optional[Decimal] = Field(default=None, ge=0)
    allowances: Optional[Decimal] = Field(default=None, ge=0)
    deductions: Optional[Decimal] = Field(default=None, ge=0)

class PayrollResponse(PayrollBase):
    id: int
    net_salary: Decimal
    employee: Optional[EmployeeResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
