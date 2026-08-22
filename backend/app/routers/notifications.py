from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.notification import NotificationResponse
from app.services import notification_service

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def read_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await notification_service.get_user_notifications(db, current_user.id)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await notification_service.mark_as_read(db, notification_id, current_user.id)
