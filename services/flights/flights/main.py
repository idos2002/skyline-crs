import logging
import time
from datetime import datetime

from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from . import dependencies, docs, models, schemas
from .config import config_logging, get_settings
from .exceptions import (
    EndpointException,
    ErrorDetails,
    ExternalDependencyException,
    FlightNotFoundException,
    ServiceNotFoundException,
)
from .util import log_access

config_logging()
log = logging.getLogger(__name__)

app = FastAPI(
    title="Flights Service",
    description=docs.app_description,
    servers=[
        {
            "url": get_settings().openapi_server_url,
            "description": "Public API Server",
        }
    ],
    root_path=get_settings().openapi_schema_prefix,
    root_path_in_servers=False,
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


@app.exception_handler(EndpointException)
async def service_not_found_exception_handler(request: Request, exc: EndpointException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
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


@app.get(
    "/flights/{origin}/{destination}/{departureTime}",
    response_model=schemas.FlightsList,
    responses=docs.flights_responses,
    summary="Find flights",
    tags=["flights"],
)
async def find_flights(
    service_flights: models.ServiceFlights | None = Depends(dependencies.get_flights),
):
    if not service_flights:
        raise ServiceNotFoundException
    return schemas.FlightsList.from_model(service_flights)


@app.get(
    "/flight/{flightId}",
    response_model=schemas.FlightDetails,
    responses=docs.flight_responses,
    summary="Get flight details",
    tags=["flights"],
)
async def get_flight_details(
    flight: models.FlightDetails | None = Depends(dependencies.get_flight_details),
):
    if not flight:
        raise FlightNotFoundException
    return schemas.FlightDetails.from_model(flight)


@app.get(
    "/flight/{flightId}/seats",
    response_model=schemas.FlightSeats,
    responses=docs.flight_seats_responses,
    summary="Get flight seats",
    tags=["flights"],
)
async def get_flight_seats(
    flight_seats: models.FlightSeats = Depends(dependencies.get_flight_seats),
):
    if not flight_seats:
        raise FlightNotFoundException
    return schemas.FlightSeats.from_model(flight_seats)
