from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from .util import CabinClass


class GeoLocation(BaseModel):
    crs: str
    coordinates: list[float]

    def __init__(self, **data):
        crs_name = data.pop("crs")["properties"]["name"]
        super().__init__(crs=crs_name, **data)


class Airport(BaseModel):
    iata_code: str
    icao_code: str
    name: str
    subdivision_code: str
    city: str
    geo_location: GeoLocation


class Service(BaseModel):
    id: int
    origin_airport: Airport
    destination_airport: Airport


class AircraftModel(BaseModel):
    icao_code: str
    iata_code: str
    name: str


class Cabin(BaseModel):
    cabin_class: CabinClass
    seats_count: int = Field(alias="total_seats_count")
    available_seats_count: int


class Flight(BaseModel):
    id: UUID
    departure_terminal: str
    departure_time: datetime
    arrival_terminal: str
    arrival_time: datetime
    aircraft_model: AircraftModel
    cabins: list[Cabin] = Field(alias="available_seats_counts")


class ServiceFlights(Service):
    flights: list[Flight]


class FlightDetails(Flight):
    service: Service


class SeatMapSection(BaseModel):
    cabin_class: CabinClass
    start_row: int
    end_row: int
    column_layout: str


class AircraftModelWithSeatMap(AircraftModel):
    seat_map: list[SeatMapSection] = Field(alias="seat_maps")


class BookedSeat(BaseModel):
    row: int = Field(alias="seat_row")
    column: str = Field(alias="seat_column")


class FlightSeats(BaseModel):
    flight_id: UUID = Field(alias="id")
    aircraft_model_with_seat_map: AircraftModelWithSeatMap = Field(
        alias="aircraft_model"
    )
    booked_seats: list[BookedSeat]
