from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.settings import SystemSettings
from app.schemas.settings import SystemSettingsUpdate

async def get_or_create_settings(db: AsyncSession) -> SystemSettings:
    result = await db.execute(select(SystemSettings).limit(1))
    settings = result.scalars().first()
    
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings

async def update_settings(db: AsyncSession, settings_in: SystemSettingsUpdate) -> SystemSettings:
    settings = await get_or_create_settings(db)
    
    settings.company_name = settings_in.company_name
    settings.company_email = settings_in.company_email
    settings.company_address = settings_in.company_address
    settings.working_hours = settings_in.working_hours
    settings.allow_employee_registration = settings_in.allow_employee_registration
    settings.require_approval_for_leaves = settings_in.require_approval_for_leaves
    settings.maintenance_mode = settings_in.maintenance_mode
    
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings
