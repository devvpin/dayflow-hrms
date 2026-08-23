from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.models.employee import Employee
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    
    db_obj = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(db_obj)
    # Flush (not commit) to obtain the generated user id while keeping the
    # optional Employee insert below in the same atomic transaction.
    await db.flush()

    # A display name from the registration form means we should also create a
    # linked Employee profile so the account appears in HR listings and
    # /employees/me works. Bare user creation (no full_name) stays supported.
    if user_in.full_name and user_in.full_name.strip():
        parts = user_in.full_name.strip().split()
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
        employee = Employee(
            employee_code=f"EMP{db_obj.id:05d}",
            first_name=first_name,
            last_name=last_name,
            user_id=db_obj.id,
        )
        db.add(employee)
        await db.flush()
        db_obj.employee_id = employee.id

    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def authenticate(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
