from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from app.models.user import Role

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    # When provided (e.g. from the registration form) a linked Employee profile
    # is created automatically. Optional so admin/HR and tests can create bare
    # user accounts without a profile.
    full_name: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: Role
    is_active: bool
    employee_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
