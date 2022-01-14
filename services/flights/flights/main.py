import uvicorn  # type: ignore
from fastapi import Depends, FastAPI, Request, status
from fastapi.responses import JSONResponse

from . import dependencies, models, schemas
from .exceptions import (
    FlightNotFoundException,
    ServiceNotFoundException,
    SkylineException,
)

app = FastAPI()


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
