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
    "flights": [
        {
            "id": "<ID of the flight>",
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
    "flights": [
        {
            "id": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
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
    ]
}
```
