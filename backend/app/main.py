from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.exceptions import sqlalchemy_exception_handler
from app.routers import auth, employees, attendance, leaves, payroll, notifications, dashboard
from app.routers import settings as settings_module

app = FastAPI(title="Dayflow HRMS")
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])
app.include_router(leaves.router, prefix="/api/leaves", tags=["leaves"])
app.include_router(payroll.router, prefix="/api/payroll", tags=["payroll"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(settings_module.router, prefix="/api/settings", tags=["settings"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
