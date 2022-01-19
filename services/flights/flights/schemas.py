from __future__ import annotations

from datetime import datetime
from uuid import UUID

from humps import camelize
from pydantic import BaseModel, Field

from . import models
from .config import get_settings
from .util import CabinClass


class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = camelize
        allow_population_by_field_name = True


class Coordinates(CamelCaseModel):
    crs: str = Field(
        title="Coordinates reference system",
        description=(
            "The coordinates reference system (CRS) URN used for the coordinates data, "
            "e.g. urn:ogc:def:crs:EPSG::4326"
        ),
    )
    data: list[float] = Field(description="The coordinates data")

    @classmethod
    def from_model(cls, geo_location: models.GeoLocation) -> Coordinates:
        return cls.construct(crs=geo_location.crs, data=geo_location.coordinates)


class Location(CamelCaseModel):
    subdivision_code: str = Field(
        title="Subdivision code",
        description="The ISO 3166-2 subdivision code the airport is located in",
    )
    city: str = Field(description="The city the airport is located in")
    coordinates: Coordinates = Field(description="Coordinates of the airport")


class Airport(CamelCaseModel):
    iata_code: str = Field(
        title="IATA code", description="IATA airport code of the airport"
    )
    icao_code: str = Field(
        title="ICAO code", description="ICAO airport code of the airport"
    )
    name: str = Field(description="Name of the airport")
    location: Location = Field(description="The airport's location")

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
    icao_code: str = Field(
        title="ICAO code", description="ICAO aircraft type designator code"
    )
    iata_code: str = Field(
        title="IATA code", description="IATA aircraft type designator code"
    )
    name: str = Field(description="Model name of the aircraft")

    @classmethod
    def from_model(cls, aircraft_model: models.AircraftModel) -> AircraftModel:
        return cls.parse_obj(aircraft_model)


class Cabin(CamelCaseModel):
    cabin_class: CabinClass = Field(
        title="Cabin class", description="Cabin class of this cabin"
    )
    seats_count: int = Field(title="Seats count", description="Total number of seats")
    available_seats_count: int = Field(
        title="Available seats count", description="Number of available seats"
    )

    @classmethod
    def from_model(cls, cabin: models.Cabin) -> Cabin:
        return cls.construct(
            cabin_class=cabin.cabin_class,
            seats_count=cabin.seats_count,
            available_seats_count=cabin.available_seats_count,
        )


class Flight(CamelCaseModel):
    id: UUID = Field(description="ID of the flight")
    departure_terminal: str = Field(
        title="Departure terminal", description="Departure terminal name"
    )
    departure_time: datetime = Field(
        title="Departure time", description="Departure time in ISO 1806 format"
    )
    arrival_terminal: str = Field(
        title="Arrival terminal", description="Arrival terminal name"
    )
    arrival_time: datetime = Field(
        title="Arrival time", description="Return time in ISO 1806 format"
    )
    aircraft_model: AircraftModel = Field(
        title="Aircraft model", description="The flight's aircraft model"
    )
    cabins: list[Cabin] = Field(description="Cabins statistics for the flight")


class FlightsList(CamelCaseModel):
    name: str = Field(description="Service name for this itinerary")
    origin: Airport = Field(description="Airport from which the flight originates")
    destination: Airport = Field(description="The destination airport for the flight")
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
    name: str = Field(description="Service name for this itinerary")
    origin: Airport = Field(description="Airport from which the flight originates")
    destination: Airport = Field(description="The destination airport for the flight")

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
    cabin_class: CabinClass = Field(
        title="Cabin class", description="Cabin class of this section"
    )
    start_row: int = Field(title="Start row", description="Start row of the section")
    end_row: int = Field(title="End row", description="End row of the section")
    column_layout: str = Field(
        title="Column layout",
        description="Column layout for this section, e.g. ABC-DE-F#H",
    )

    @classmethod
    def from_model(cls, seat_map_section: models.SeatMapSection) -> SeatMapSection:
        return cls.parse_obj(seat_map_section)


class BookedSeat(CamelCaseModel):
    row: int = Field(description="Row number of the booked seat")
    column: str = Field(description="Column name of the booked seat")

    @classmethod
    def from_model(cls, booked_seat: models.BookedSeat) -> BookedSeat:
        return cls.parse_obj(booked_seat)


class FlightSeats(CamelCaseModel):
    flight_id: UUID = Field(title="Flight ID", description="ID of the flight")
    aircraft_model: AircraftModel = Field(
        title="Aircraft model", description="The flight's aircraft model"
    )
    seat_map: list[SeatMapSection] = Field(
        title="Seat map", description="Seat map of the flight's aircraft"
    )
    booked_seats: list[BookedSeat] = Field(
        title="Booked seats", description="The flight's booked seats"
    )

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
