# Get Flight Details

Gets the flight with the requested flight ID.

## Request
```http
GET /flight/{flightId}
```

| Parameter    | Description                            | Format      |
| ------------ | -------------------------------------- | ----------- |
| `{flightId}` | The flight ID of the requested flight. | UUID string |

Examples:
```http
GET /flight/17564e2f-7d32-4d4a-9d99-27ccd768fb7d
```

## Success Response - `200 OK`

```json
{
    "id": "<ID of the flight>",
    "name": "<Service name for this itinerary>",
    "origin": {
        "iataCode": "<IATA airport code of the origin>",
        "icaoCode": "<ICAO airport code of the origin>",
        "name": "<Origin airport name>",
        "location": {
            "subdivisionCode": "<The ISO 3166-2 subdivision code the airport is located in>",
            "city": "<The city the airport is located in>",
            "latitude": "<Geographic latitude coordinate of the airport>",
            "longitude": "<Geographic longitude coordinate of the airport>"
        }
    },
    "destination": {
        "iataCode": "<IATA airport code of the destination>",
        "icaoCode": "<ICAO airport code of the destination>",
        "name": "<Destination airport name>",
        "location": {
            "subdivisionCode": "<The ISO 3166-2 subdivision code the airport is located in>",
            "city": "<The city the airport is located in>",
            "latitude": "<Geographic latitude coordinate of the airport>",
            "longitude": "<Geographic longitude coordinate of the airport>"
        }
    },
    "departureTerminal": "<Departure terminal name>",
    "departureTime": "<Departure time in UTC ISO 1806 format>",
    "arrivalTerminal": "<Arrival terminal name>",
    "arrivalTime": "<Return time in UTC ISO 1806 format>",
    "planeModelNumber": "<Plane model number>",
    "planeModelName": "<Plane model name>",
    "cabins": [
        {
            "cabinClass": "<Cabin class: E / B / F>",
            "availableSeatsCount": "<Number of available seats>"
        },
    ]
}
```

Example:
```json
{
    "id": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
    "name": "SKL1",
    "origin": {
        "iataCode": "TLV",
        "icaoCode": "LLBG",
        "name": "Ben Gurion Airport",
        "location": {
            "subdivisionCode": "IL-M",
            "city": "Tel Aviv-Yafo",
            "latitude": "32.009444",
            "longitude": "34.882778"
        }
    },
    "destination": {
        "iataCode": "JFK",
        "icaoCode": "KJFK",
        "name": "John F. Kennedy International Airport",
        "location": {
            "subdivisionCode": "US-NY",
            "city": "New York City",
            "latitude": "40.639722",
            "longitude": "-73.778889"
        }
    },
    "departureTerminal": "3",
    "departureTime": "2021-10-11T22:45:00Z",
    "arrivalTerminal": "4",
    "arrivalTime": "2021-10-12T10:45:00Z",
    "planeModelNumber": "B789",
    "planeModelName": "Boeing 787-9 Dreamliner",
    "cabins": [
        {
            "cabinClass": "E",
            "availableSeatsCount": "16"
        },
        {
            "cabinClass": "B",
            "availableSeatsCount": "7"
        },
        {
            "cabinClass": "F",
            "availableSeatsCount": "3"
        }
    ]
}
```

## Flight Not Found Response - `404 Not Found`

```json
{
    "error": "Flight not found",
    "message": "Could not find flight with the given flight ID."
}
```
