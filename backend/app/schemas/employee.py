from pydantic import BaseModel, EmailStr, ConfigDict, computed_field, model_validator
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
    user_id: Optional[int] = None
    joining_date: Optional[date] = None
    email: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def _populate_user_fields(cls, data):
        # Surface the linked User's email/role/is_active (stored on the User
        # row, not Employee) so admin views can display them. The `user`
        # relationship must be eager-loaded; if it isn't, degrade to None
        # rather than triggering an async lazy-load that would raise.
        if isinstance(data, dict):
            return data
        try:
            user = data.user
        except Exception:
            return data
        if user is not None:
            try:
                data.email = user.email
                data.role = user.role
                data.is_active = user.is_active
            except Exception:
                pass
        return data

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @computed_field
    @property
    def employee_id(self) -> str:
        return self.employee_code
