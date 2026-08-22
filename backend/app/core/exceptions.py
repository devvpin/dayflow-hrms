from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging

logger = logging.getLogger("hrms_exception_handler")

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    if isinstance(exc, IntegrityError):
        logger.error(f"Integrity check failed: {exc}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "A database constraint was violated, such as a duplicate entry."}
        )
    logger.error(f"SQL Backend Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal database error occurred while processing the request."}
    )
