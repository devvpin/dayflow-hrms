from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from app.models.user import Role

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: Role
    is_active: bool
    employee_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
