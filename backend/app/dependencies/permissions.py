from fastapi import Depends, HTTPException, status
from app.models.user import User, Role
from app.dependencies.auth import get_current_user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def require_hr(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.HR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def require_admin_or_hr(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [Role.ADMIN, Role.HR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def require_employee(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.EMPLOYEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
