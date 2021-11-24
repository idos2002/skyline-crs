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
            "country": "<The country the airport is located in>",
            "administrativeDivision": "<The administrative division (e.g. state, province, region) the airport is located in (optional)>",
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
            "country": "<The country the airport is located in>",
            "administrativeDivision": "<The administrative division (e.g. state, province, region) the airport is located in (optional)>",
            "city": "<The city the airport is located in>",
            "latitude": "<Geographic latitude coordinate of the airport>",
            "longitude": "<Geographic longitude coordinate of the airport>"
        }
    },
    "departureTerminal": "<Departure terminal name>",
    "arrivalTerminal": "<Arrival terminal name>",
    "departureTime": "<Departure time in UTC ISO 1806 format>",
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
            "country": "Israel",
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
            "country": "United States",
            "administrativeDivision": "New York",
            "city": "New York City",
            "latitude": "40.639722",
            "longitude": "-73.778889"
        }
    },
    "departureTerminal": "3",
    "arrivalTerminal": "4",
    "departureTime": "2021-10-11T22:45:00Z",
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
