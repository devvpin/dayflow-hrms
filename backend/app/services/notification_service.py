from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from typing import Sequence
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

async def create_notification(db: AsyncSession, notif_in: NotificationCreate) -> Notification:
    new_notif = Notification(
        user_id=notif_in.user_id,
        title=notif_in.title,
        message=notif_in.message,
        is_read=False
    )
    db.add(new_notif)
    await db.commit()
    await db.refresh(new_notif)
    return new_notif

async def get_user_notifications(db: AsyncSession, user_id: int) -> Sequence[Notification]:
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> Notification:
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notif = result.scalars().first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notif.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this notification")
        
    notif.is_read = True
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif
