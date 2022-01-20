from typing import Any

from starlette import status

from .exceptions import ErrorDetails

app_description = """
The flights service presents an external API for the inventory,
which contains all of the flights information.

## Features
- Get a list of all available flights for from the origin to the destination.
- Get details about specific flights.
- Get flight seats and seat maps.
"""

flights_examples: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "name": "SK1",
        "origin": {
            "iataCode": "TLV",
            "icaoCode": "LLBG",
            "name": "Ben Gurion Airport",
            "location": {
                "subdivisionCode": "IL-M",
                "city": "Tel Aviv-Yafo",
                "coordinates": {
                    "crs": "urn:ogc:def:crs:EPSG::4326",
                    "data": [32.009444, 34.882778],
                },
            },
        },
        "destination": {
            "iataCode": "LAX",
            "icaoCode": "KLAX",
            "name": "Los Angeles International Airport",
            "location": {
                "subdivisionCode": "US-CA",
                "city": "Los Angeles",
                "coordinates": {
                    "crs": "urn:ogc:def:crs:EPSG::4326",
                    "data": [33.9425, -61.591944],
                },
            },
        },
        "flights": [
            {
                "id": "eb2e5080-000e-440d-8242-46428e577ce5",
                "departureTerminal": "3",
                "departureTime": "2019-12-31T23:05:00+00:00",
                "arrivalTerminal": "B",
                "arrivalTime": "2020-01-01T14:00:00+00:00",
                "aircraftModel": {
                    "icaoCode": "B789",
                    "iataCode": "789",
                    "name": "Boeing 787-9 Dreamliner",
                },
                "cabins": [
                    {"cabinClass": "E", "seatsCount": 204, "availableSeatsCount": 151},
                    {"cabinClass": "B", "seatsCount": 35, "availableSeatsCount": 16},
                    {"cabinClass": "F", "seatsCount": 32, "availableSeatsCount": 20},
                ],
            }
        ],
    },
    status.HTTP_404_NOT_FOUND: {
        "error": "Flights not found",
        "message": "The flights for the requested origin and destination airports.",
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "error": "Validation error",
        "message": "Request has an invalid format.",
        "details": [
            {
                "cause": "path/origin",
                "message": 'string does not match regex "^[a-zA-Z]{3}$"',
            },
        ],
    },
}

flights_responses: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "content": {
            "application/json": {"example": flights_examples[status.HTTP_200_OK]}
        }
    },
    status.HTTP_404_NOT_FOUND: {
        "model": ErrorDetails,
        "description": "Flights not found",
        "content": {
            "application/json": {
                "example": flights_examples[status.HTTP_404_NOT_FOUND],
            }
        },
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "model": ErrorDetails,
        "description": "Validation error",
        "content": {
            "application/json": {
                "example": flights_examples[status.HTTP_422_UNPROCESSABLE_ENTITY]
            }
        },
    },
}


flight_examples: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "id": "eb2e5080-000e-440d-8242-46428e577ce5",
        "name": "SK1",
        "origin": {
            "iataCode": "TLV",
            "icaoCode": "LLBG",
            "name": "Ben Gurion Airport",
            "location": {
                "subdivisionCode": "IL-M",
                "city": "Tel Aviv-Yafo",
                "coordinates": {
                    "crs": "urn:ogc:def:crs:EPSG::4326",
                    "data": [32.009444, 34.882778],
                },
            },
        },
        "destination": {
            "iataCode": "LAX",
            "icaoCode": "KLAX",
            "name": "Los Angeles International Airport",
            "location": {
                "subdivisionCode": "US-CA",
                "city": "Los Angeles",
                "coordinates": {
                    "crs": "urn:ogc:def:crs:EPSG::4326",
                    "data": [33.9425, -61.591944],
                },
            },
        },
        "departureTerminal": "3",
        "departureTime": "2019-12-31T23:05:00+00:00",
        "arrivalTerminal": "B",
        "arrivalTime": "2020-01-01T14:00:00+00:00",
        "aircraftModel": {
            "icaoCode": "B789",
            "iataCode": "789",
            "name": "Boeing 787-9 Dreamliner",
        },
        "cabins": [
            {"cabinClass": "E", "seatsCount": 204, "availableSeatsCount": 151},
            {"cabinClass": "B", "seatsCount": 35, "availableSeatsCount": 16},
            {"cabinClass": "F", "seatsCount": 32, "availableSeatsCount": 20},
        ],
    },
    status.HTTP_404_NOT_FOUND: {
        "error": "Flights not found",
        "message": "Could not find flight with the requested flight ID.",
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "error": "Validation error",
        "message": "Request has an invalid format.",
        "details": [
            {"cause": "path/flight_id", "message": "value is not a valid uuid"}
        ],
    },
}


flight_responses: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "content": {
            "application/json": {"example": flight_examples[status.HTTP_200_OK]}
        }
    },
    status.HTTP_404_NOT_FOUND: {
        "model": ErrorDetails,
        "description": "Flight not found",
        "content": {
            "application/json": {"example": flight_examples[status.HTTP_404_NOT_FOUND]}
        },
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "model": ErrorDetails,
        "description": "Validation error",
        "content": {
            "application/json": {
                "example": flight_examples[status.HTTP_422_UNPROCESSABLE_ENTITY]
            }
        },
    },
}


flight_seats_examples: dict[int | str, Any] = {
    **flight_examples,
    status.HTTP_200_OK: {
        "flightId": "eb2e5080-000e-440d-8242-46428e577ce5",
        "aircraftModel": {
            "icaoCode": "B789",
            "iataCode": "789",
            "name": "Boeing 787-9 Dreamliner",
        },
        "seatMap": [
            {
                "cabinClass": "F",
                "startRow": 1,
                "endRow": 8,
                "columnLayout": "A-DG-K",
            },
            {
                "cabinClass": "B",
                "startRow": 10,
                "endRow": 14,
                "columnLayout": "AC-DFG-HK",
            },
            {
                "cabinClass": "E",
                "startRow": 21,
                "endRow": 28,
                "columnLayout": "ABC-DFG-HJK",
            },
            {
                "cabinClass": "E",
                "startRow": 29,
                "endRow": 30,
                "columnLayout": "###-###-HJK",
            },
            {
                "cabinClass": "E",
                "startRow": 35,
                "endRow": 36,
                "columnLayout": "ABC-###-HJK",
            },
            {
                "cabinClass": "E",
                "startRow": 37,
                "endRow": 48,
                "columnLayout": "ABC-DFG-HJK",
            },
            {
                "cabinClass": "E",
                "startRow": 49,
                "endRow": 50,
                "columnLayout": "###-DFG-###",
            },
        ],
        "bookedSeats": [
            {"row": 40, "column": "D"},
            {"row": 40, "column": "F"},
            {"row": 40, "column": "G"},
        ],
    },
}


flight_seats_responses: dict[int | str, Any] = {
    **flight_responses,
    status.HTTP_200_OK: {
        "content": {
            "application/json": {"example": flight_seats_examples[status.HTTP_200_OK]}
        }
    },
}
