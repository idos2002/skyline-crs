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
    
}
```

Example:
```json
{
    
}
```
