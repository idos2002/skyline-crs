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
            "coordinates": {
                "crs": "<The coordinates reference system (CRS) URN used for the coordinates data, e.g. urn:ogc:def:crs:EPSG::4326>",
                "data": [ "<The coordinates data>" ]
            }
        }
    },
    "destination": {
        "iataCode": "<IATA airport code of the destination>",
        "icaoCode": "<ICAO airport code of the destination>",
        "name": "<Destination airport name>",
        "location": {
            "subdivisionCode": "<The ISO 3166-2 subdivision code the airport is located in>",
            "city": "<The city the airport is located in>",
            "coordinates": {
                "crs": "<The coordinates reference system (CRS) URN used for the coordinates data, e.g. urn:ogc:def:crs:EPSG::4326>",
                "data": [ "<The coordinates data>" ]
            }
        }
    },
    "departureTerminal": "<Departure terminal name>",
    "departureTime": "<Departure time in ISO 1806 format>",
    "arrivalTerminal": "<Arrival terminal name>",
    "arrivalTime": "<Return time in ISO 1806 format>",
    "aircraftModel": {
        "icaoCode": "<ICAO aircraft type designator code>",
        "iataCode": "<IATA aircraft type designator code>",
        "name": "<Model name of the aircraft>"
    },
    "cabins": [
        {
            "cabinClass": "<Cabin class: E / B / F>",
            "seatsCount": "<Total number of seats>",
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
            "coordinates": {
                "crs": "urn:ogc:def:crs:EPSG::4326",
                "data": [ 32.009444, 34.882778 ]
            }
        }
    },
    "destination": {
        "iataCode": "JFK",
        "icaoCode": "KJFK",
        "name": "John F. Kennedy International Airport",
        "location": {
            "subdivisionCode": "US-NY",
            "city": "New York City",
            "coordinates": {
                "crs": "urn:ogc:def:crs:EPSG::4326",
                "data": [ 40.639722, -73.778889 ]
            }
        }
    },
    "departureTerminal": "3",
    "departureTime": "2021-10-11T22:45:00Z",
    "arrivalTerminal": "4",
    "arrivalTime": "2021-10-12T10:45:00Z",
    "aircraftModel": {
        "icaoCode": "B789",
        "iataCode": "789",
        "name": "Boeing 787-9 Dreamliner"
    },
    "cabins": [
        {
            "cabinClass": "E",
            "seatsCount": 204,
            "availableSeatsCount": 201
        },
        {
            "cabinClass": "B",
            "seatsCount": 35,
            "availableSeatsCount": 14
        },
        {
            "cabinClass": "F",
            "seatsCount": 32,
            "availableSeatsCount": 21
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
