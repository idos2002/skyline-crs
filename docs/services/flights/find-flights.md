# Find Flights

Retrieve a list of flights from the requested origin to the requested destination at the provided date.

## Request
```http
GET /flights/{origin}/{destination}/{departureDate}
```

| Parameter         | Description                                                        | Format                                          |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| `{origin}`        | The IATA airport code of the airport to depart from.               | 3-letter IATA airport code, e.g. TLV            |
| `{destination}`   | The IATA airport code of the destination airport.                  | 3-letter IATA airport code                      |
| `{departureDate}` | The local date of departure (local to origin).                     | ISO 1806 date, e.g. 2021-01-01                  |
| `passengers`      | The number of passengers to find a flight for. <br> **Default:** 1 | Positive integer, e.g. 2                        |
| `class`           | The cabin class of the flight. <br> **Default:** all cabin classes | One of the following cabin class codes: E, B, F |

Examples:
```http
GET /flights/TLV/BER/2021-01-01
GET /flights/AMS/FRA/2021-12-07?passengers=4
GET /flights/TLV/JFK/2021-11-12?class=E
GET /flights/LAX/TLV/2021-03-22?passengers=2&class=F
```

> **Cabin Class Codes**  
> There are three available cabin classes, each associated with a single letter code:
> - **E** - Economy class
> - **B** - Business class
> - **F** - First class

## Success Response - `200 OK`

```json
{
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
    "flights": [
        {
            "id": "<ID of the flight>",
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
        },
    ]
}
```

Example:
```json
{
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
    "flights": [
        {
            "id": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
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
    ]
}
```
