from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import date

class PayrollBase(BaseModel):
    employee_id: int
    effective_from: date
    basic_salary: Decimal
    deductions: Decimal = Decimal('0.0')
    allowances: Decimal = Decimal('0.0')

class PayrollCreate(PayrollBase):
    pass

class PayrollResponse(PayrollBase):
    id: int
    net_salary: Decimal
    
    model_config = ConfigDict(from_attributes=True)
