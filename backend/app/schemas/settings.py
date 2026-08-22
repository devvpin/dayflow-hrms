from pydantic import BaseModel, ConfigDict

class SystemSettingsBase(BaseModel):
    company_name: str
    company_email: str
    company_address: str
    working_hours: str
    allow_employee_registration: bool
    require_approval_for_leaves: bool
    maintenance_mode: bool

class SystemSettingsUpdate(SystemSettingsBase):
    pass

class SystemSettingsResponse(SystemSettingsBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
