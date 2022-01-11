from typing import Any

origin = "TLV"
destination = "LAX"
no_flights_destination = "JFK"
departure_time = "2019-12-31T23:05:00+00:00"

success_response_all_flights: dict[str, Any] = {
    "name": "SK1",
    "origin": {
        "iataCode": origin,
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
        "iataCode": destination,
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
            "departureTime": departure_time,
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
}

flights_not_found_response: dict[str, Any] = {
    "error": "Flights not found",
    "message": "The flights for the requested origin and destination airports.",
}
