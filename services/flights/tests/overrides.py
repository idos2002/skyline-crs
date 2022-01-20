from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

from fastapi import Path, Query

from flights.models import FlightDetails, FlightSeats, ServiceFlights
from flights.util import CabinClass


async def get_flights(
    origin: str = Path(..., regex=r"^[a-zA-Z]{3}$"),
    destination: str = Path(..., regex=r"^[a-zA-Z]{3}$"),
    departure_time: datetime = Path(..., alias="departureTime"),
    passengers: int = Query(1, ge=1),
    cabin_classes: list[CabinClass] | None = Query(None, alias="cabin"),
) -> ServiceFlights | None:
    response_origin = "TLV"
    response_destination = "LAX"
    response_departure_time = "2019-12-31T23:05:00+00:00"

    response_cabins: list[dict[str, Any]] = [
        {
            "cabin_class": "E",
            "total_seats_count": 204,
            "available_seats_count": 151,
        },
        {
            "cabin_class": "B",
            "total_seats_count": 35,
            "available_seats_count": 16,
        },
        {
            "cabin_class": "F",
            "total_seats_count": 32,
            "available_seats_count": 20,
        },
    ]
    if not cabin_classes:
        cabin_classes = [c for c in CabinClass]
    else:
        cabin_classes = list(set(cabin_classes))
    response_cabins = [
        c
        for c in response_cabins
        if c["available_seats_count"] >= passengers
        and c["cabin_class"] in cabin_classes
    ]

    response_flights: list[dict[str, Any]] = [
        {
            "id": "eb2e5080-000e-440d-8242-46428e577ce5",
            "departure_terminal": "3",
            "departure_time": response_departure_time,
            "arrival_terminal": "B",
            "arrival_time": "2020-01-01T14:00:00+00:00",
            "aircraft_model": {
                "icao_code": "B789",
                "iata_code": "789",
                "name": "Boeing 787-9 Dreamliner",
            },
            "available_seats_counts": response_cabins,
        }
    ]
    start_time = datetime.fromisoformat(response_departure_time)
    end_time = start_time + timedelta(days=1)
    if departure_time < start_time or departure_time > end_time:
        response_flights = []

    flights_data: dict[str, Any] = {
        "id": 1,
        "origin_airport": {
            "iata_code": response_origin,
            "icao_code": "LLBG",
            "name": "Ben Gurion Airport",
            "subdivision_code": "IL-M",
            "city": "Tel Aviv-Yafo",
            "geo_location": {
                "type": "Point",
                "crs": {
                    "type": "name",
                    "properties": {"name": "urn:ogc:def:crs:EPSG::4326"},
                },
                "coordinates": [32.009444, 34.882778],
            },
        },
        "destination_airport": {
            "iata_code": response_destination,
            "icao_code": "KLAX",
            "name": "Los Angeles International Airport",
            "subdivision_code": "US-CA",
            "city": "Los Angeles",
            "geo_location": {
                "type": "Point",
                "crs": {
                    "type": "name",
                    "properties": {"name": "urn:ogc:def:crs:EPSG::4326"},
                },
                "coordinates": [33.9425, -61.591944],
            },
        },
        "flights": response_flights,
    }

    if response_origin != origin.upper() or response_destination != destination.upper():
        return None

    return ServiceFlights(**flights_data)


async def get_flight_details(
    flight_id: UUID = Path(..., alias="flightId")
) -> FlightDetails | None:
    response_flight_id = "eb2e5080-000e-440d-8242-46428e577ce5"
    flight_data: dict[str, Any] = {
        "id": response_flight_id,
        "service": {
            "id": 1,
            "origin_airport": {
                "iata_code": "TLV",
                "icao_code": "LLBG",
                "name": "Ben Gurion Airport",
                "subdivision_code": "IL-M",
                "city": "Tel Aviv-Yafo",
                "geo_location": {
                    "type": "Point",
                    "crs": {
                        "type": "name",
                        "properties": {"name": "urn:ogc:def:crs:EPSG::4326"},
                    },
                    "coordinates": [32.009444, 34.882778],
                },
            },
            "destination_airport": {
                "iata_code": "LAX",
                "icao_code": "KLAX",
                "name": "Los Angeles International Airport",
                "subdivision_code": "US-CA",
                "city": "Los Angeles",
                "geo_location": {
                    "type": "Point",
                    "crs": {
                        "type": "name",
                        "properties": {"name": "urn:ogc:def:crs:EPSG::4326"},
                    },
                    "coordinates": [33.9425, -61.591944],
                },
            },
        },
        "departure_terminal": "3",
        "departure_time": "2019-12-31T23:05:00+00:00",
        "arrival_terminal": "B",
        "arrival_time": "2020-01-01T14:00:00+00:00",
        "aircraft_model": {
            "iata_code": "789",
            "icao_code": "B789",
            "name": "Boeing 787-9 Dreamliner",
        },
        "available_seats_counts": [
            {
                "cabin_class": "E",
                "total_seats_count": 204,
                "available_seats_count": 151,
            },
            {
                "cabin_class": "B",
                "total_seats_count": 35,
                "available_seats_count": 16,
            },
            {
                "cabin_class": "F",
                "total_seats_count": 32,
                "available_seats_count": 20,
            },
        ],
    }
    if UUID(response_flight_id) != flight_id:
        return None
    return FlightDetails(**flight_data)


async def get_flight_seats(
    flight_id: UUID = Path(..., alias="flightId")
) -> FlightSeats | None:
    response_flight_id = "eb2e5080-000e-440d-8242-46428e577ce5"
    flight_seats_data = {
        "id": response_flight_id,
        "aircraft_model": {
            "icao_code": "B789",
            "iata_code": "789",
            "name": "Boeing 787-9 Dreamliner",
            "seat_maps": [
                {
                    "cabin_class": "F",
                    "start_row": 1,
                    "end_row": 8,
                    "column_layout": "A-DG-K",
                },
                {
                    "cabin_class": "B",
                    "start_row": 10,
                    "end_row": 14,
                    "column_layout": "AC-DFG-HK",
                },
                {
                    "cabin_class": "E",
                    "start_row": 21,
                    "end_row": 28,
                    "column_layout": "ABC-DFG-HJK",
                },
                {
                    "cabin_class": "E",
                    "start_row": 29,
                    "end_row": 30,
                    "column_layout": "###-###-HJK",
                },
                {
                    "cabin_class": "E",
                    "start_row": 35,
                    "end_row": 36,
                    "column_layout": "ABC-###-HJK",
                },
                {
                    "cabin_class": "E",
                    "start_row": 37,
                    "end_row": 48,
                    "column_layout": "ABC-DFG-HJK",
                },
                {
                    "cabin_class": "E",
                    "start_row": 49,
                    "end_row": 50,
                    "column_layout": "###-DFG-###",
                },
            ],
        },
        "booked_seats": [
            {"seat_row": 40, "seat_column": "D"},
            {"seat_row": 40, "seat_column": "F"},
            {"seat_row": 40, "seat_column": "G"},
        ],
    }
    if UUID(response_flight_id) != flight_id:
        return None
    return FlightSeats(**flight_seats_data)
