from pydantic import BaseModel, EmailStr, ConfigDict, computed_field
from typing import Optional
from datetime import date
from app.models.user import Role

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    employee_code: str
    email: EmailStr
    password: str
    role: Role = Role.EMPLOYEE

class EmployeeUpdateAdmin(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    joining_date: Optional[date] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeUpdateMe(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    employee_code: str
    user_id: int
    joining_date: Optional[date] = None
    
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @computed_field
    @property
    def employee_id(self) -> str:
        return self.employee_code
