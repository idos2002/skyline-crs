import logging
import time
from datetime import datetime

from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.responses import JSONResponse

from . import dependencies, models, schemas
from .config import config_logging
from .exceptions import (
    FlightNotFoundException,
    ServiceNotFoundException,
    SkylineException,
)
from .util import log_access

config_logging()
log = logging.getLogger(__name__)

app = FastAPI()


@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    start_time = datetime.utcnow()
    start_measure_ns = time.perf_counter_ns()

    response: Response = await call_next(request)

    duration_ns = time.perf_counter_ns() - start_measure_ns
    end_time = datetime.utcnow()

    log_access(log, request, response, start_time, end_time, duration_ns)

    return response


@app.exception_handler(SkylineException)
async def service_not_found_exception_handler(request: Request, exc: SkylineException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=exc.details.dict(),
    )


@app.get(
    "/flights/{origin}/{destination}/{departure_time}",
    response_model=schemas.FlightsList,
    summary="Find flights",
)
async def find_flights(
    service_flights: models.ServiceFlights | None = Depends(dependencies.get_flights),
):
    if not service_flights:
        raise ServiceNotFoundException
    return schemas.FlightsList.from_model(service_flights)


@app.get(
    "/flight/{flight_id}",
    response_model=schemas.FlightDetails,
    summary="Get flight details",
)
async def get_flight_details(
    flight: models.FlightDetails | None = Depends(dependencies.get_flight_details),
):
    if not flight:
        raise FlightNotFoundException
    return schemas.FlightDetails.from_model(flight)


@app.get(
    "/flight/{flight_id}/seats",
    response_model=schemas.FlightSeats,
    description="Get flight seats",
)
async def get_flight_seats(
    flight_seats: models.FlightSeats = Depends(dependencies.get_flight_seats),
):
    if not flight_seats:
        raise FlightNotFoundException
    return schemas.FlightSeats.from_model(flight_seats)
