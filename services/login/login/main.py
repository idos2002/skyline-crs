import logging
import time
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from . import docs
from .config import Settings, config_logging, get_settings
from .dependencies import validate_login_details
from .exceptions import (
    AuthenticationException,
    ErrorDetails,
    ExternalDependencyException,
)
from .models import PnrValidationDetails
from .schemas import AccessToken
from .util import UuidJsonEncoder, log_access

config_logging()
log = logging.getLogger(__name__)

app = FastAPI(
    title="Login Service",
    description=docs.app_description,
)


@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    start_time = datetime.utcnow()
    start_measure_ns = time.perf_counter_ns()

    response: Response = await call_next(request)

    duration_ns = time.perf_counter_ns() - start_measure_ns
    end_time = datetime.utcnow()

    log_access(log, request, response, start_time, end_time, duration_ns)

    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder(ErrorDetails.from_request_validation_error(exc)),
    )


@app.exception_handler(AuthenticationException)
async def authentication_exception_handler(
    request: Request, exc: AuthenticationException
):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=jsonable_encoder(exc.details, exclude_none=True),
    )


@app.exception_handler(ExternalDependencyException)
async def request_exception_handler(request: Request, exc: ExternalDependencyException):
    response = ErrorDetails(
        error="Internal server error",
        message="The server has experienced an unrecoverable error.",
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=jsonable_encoder(response, exclude_none=True),
    )


@app.post(
    "/login",
    response_model=AccessToken,
    responses=docs.responses,
    summary="Log in",
    tags=["login"],
)
async def login(
    pnr: PnrValidationDetails | None = Depends(validate_login_details),
    settings: Settings = Depends(get_settings),
):
    if not pnr:
        raise AuthenticationException
    issued_at = datetime.now(tz=timezone.utc)
    token = jwt.encode(
        {
            "sub": pnr.id,
            "iat": issued_at,
            "exp": issued_at + timedelta(minutes=30),
        },
        settings.access_token_secret,
        algorithm="HS256",
        json_encoder=UuidJsonEncoder,
    )
    return AccessToken(token=token)
