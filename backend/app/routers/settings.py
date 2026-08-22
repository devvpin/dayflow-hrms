from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.dependencies.permissions import require_admin_or_hr
from app.schemas.settings import SystemSettingsResponse, SystemSettingsUpdate
from app.services import settings_service

router = APIRouter()

@router.get("", response_model=SystemSettingsResponse)
async def read_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await settings_service.get_or_create_settings(db)

@router.put("", response_model=SystemSettingsResponse)
async def update_settings(
    settings_in: SystemSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr)
):
    return await settings_service.update_settings(db, settings_in)
