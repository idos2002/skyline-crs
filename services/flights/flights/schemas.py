from __future__ import annotations

from datetime import datetime
from uuid import UUID

from humps import camelize
from pydantic import BaseModel

from . import models
from .dependencies import get_settings
from .util import CabinClass


class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = camelize
        allow_population_by_field_name = True


class Coordinates(CamelCaseModel):
    crs: str
    data: list[float]

    @classmethod
    def from_model(cls, geo_location: models.GeoLocation) -> Coordinates:
        return cls.construct(crs=geo_location.crs, data=geo_location.coordinates)


class Location(CamelCaseModel):
    subdivision_code: str
    city: str
    coordinates: Coordinates


class Airport(CamelCaseModel):
    iata_code: str
    icao_code: str
    name: str
    location: Location

    @classmethod
    def from_model(cls, airport: models.Airport) -> Airport:
        return cls.construct(
            iata_code=airport.iata_code,
            icao_code=airport.icao_code,
            name=airport.name,
            location=Location.construct(
                subdivision_code=airport.subdivision_code,
                city=airport.city,
                coordinates=Coordinates.from_model(airport.geo_location),
            ),
        )


class AircraftModel(CamelCaseModel):
    icao_code: str
    iata_code: str
    name: str

    @classmethod
    def from_model(cls, aircraft_model: models.AircraftModel) -> AircraftModel:
        return cls.parse_obj(aircraft_model)


class Cabin(CamelCaseModel):
    cabin_class: CabinClass
    seats_count: int
    available_seats_count: int

    @classmethod
    def from_model(cls, cabin: models.Cabin) -> Cabin:
        return cls.construct(
            cabin_class=cabin.cabin_class,
            seats_count=cabin.seats_count,
            available_seats_count=cabin.available_seats_count,
        )


class Flight(CamelCaseModel):
    id: UUID
    departure_terminal: str
    departure_time: datetime
    arrival_terminal: str
    arrival_time: datetime
    aircraft_model: AircraftModel
    cabins: list[Cabin]


class FlightsList(CamelCaseModel):
    name: str
    origin: Airport
    destination: Airport
    flights: list[Flight]

    @classmethod
    def from_model(cls, service_flights: models.ServiceFlights) -> FlightsList:
        settings = get_settings()
        return cls.construct(
            name=f"{settings.iata_airline_code}{service_flights.id}",
            origin=Airport.from_model(service_flights.origin_airport),
            destination=Airport.from_model(service_flights.destination_airport),
            flights=[
                Flight.construct(
                    id=flight.id,
                    departure_terminal=flight.departure_terminal,
                    departure_time=flight.departure_time,
                    arrival_time=flight.arrival_time,
                    arrival_terminal=flight.arrival_terminal,
                    aircraft_model=AircraftModel.from_model(flight.aircraft_model),
                    cabins=[Cabin.from_model(c) for c in flight.cabins],
                )
                for flight in service_flights.flights
            ],
        )


class FlightDetails(Flight):
    name: str
    origin: Airport
    destination: Airport

    @classmethod
    def from_model(cls, flight: models.FlightDetails) -> FlightDetails:
        settings = get_settings()
        return cls.construct(
            id=flight.id,
            name=f"{settings.iata_airline_code}{flight.service.id}",
            origin=Airport.from_model(flight.service.origin_airport),
            destination=Airport.from_model(flight.service.destination_airport),
            departure_terminal=flight.departure_terminal,
            departure_time=flight.departure_time,
            arrival_terminal=flight.arrival_terminal,
            arrival_time=flight.arrival_time,
            aircraft_model=AircraftModel.from_model(flight.aircraft_model),
            cabins=[Cabin.from_model(c) for c in flight.cabins],
        )


class SeatMapSection(CamelCaseModel):
    cabin_class: CabinClass
    start_row: int
    end_row: int
    column_layout: str

    @classmethod
    def from_model(cls, seat_map_section: models.SeatMapSection) -> SeatMapSection:
        return cls.parse_obj(seat_map_section)


class BookedSeat(CamelCaseModel):
    row: int
    column: str

    @classmethod
    def from_model(cls, booked_seat: models.BookedSeat) -> BookedSeat:
        return cls.parse_obj(booked_seat)


class FlightSeats(CamelCaseModel):
    flight_id: UUID
    aircraft_model: AircraftModel
    seat_map: list[SeatMapSection]
    booked_seats: list[BookedSeat]

    @classmethod
    def from_model(cls, flight_seats: models.FlightSeats) -> FlightSeats:
        return cls.construct(
            flight_id=flight_seats.flight_id,
            aircraft_model=AircraftModel.from_model(
                flight_seats.aircraft_model_with_seat_map
            ),
            seat_map=[
                SeatMapSection.from_model(s)
                for s in flight_seats.aircraft_model_with_seat_map.seat_map
            ],
            booked_seats=[BookedSeat.from_model(b) for b in flight_seats.booked_seats],
        )
