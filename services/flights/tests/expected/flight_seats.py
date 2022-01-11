from typing import Any

existing_flight_id = "eb2e5080-000e-440d-8242-46428e577ce5"
nonexistent_flight_id = "dd196d12-d12e-4c97-97db-4e24e253b6b4"  # Some random UUIDv4

success_response: dict[str, Any] = {
    "flightId": existing_flight_id,
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
}

flight_not_found_response: dict[str, Any] = {
    "error": "Flight not found",
    "message": "Could not find flight with the requested flight ID.",
}
