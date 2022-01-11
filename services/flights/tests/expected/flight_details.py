from typing import Any

existing_flight_id = "eb2e5080-000e-440d-8242-46428e577ce5"
nonexistent_flight_id = "dd196d12-d12e-4c97-97db-4e24e253b6b4"  # Some random UUIDv4

success_response: dict[str, Any] = {
    "id": existing_flight_id,
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
}

flight_not_found_response: dict[str, Any] = {
    "error": "Flight not found",
    "message": "Could not find flight with the requested flight ID.",
}
