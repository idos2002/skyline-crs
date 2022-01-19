# Get Flight Seats

Gets details about the seats in the requested flight. The result contains the seat map for this flight as well as a list of the booked seats on this flight.

## Request
```http
GET /flight/{flightId}/seats
```

| Parameter    | Description                            | Format      |
| ------------ | -------------------------------------- | ----------- |
| `{flightId}` | The flight ID of the requested flight. | UUID string |

Examples:
```http
GET /flight/17564e2f-7d32-4d4a-9d99-27ccd768fb7d/seats
```

> **Cabin Class Codes**  
> There are three available cabin classes, each associated with a single letter code:
> - **E** - Economy class
> - **B** - Business class
> - **F** - First class

> **Seat Map Column Layouts**  
> The column layout of a seat map represents the way columns are spread in a seat map section using a string of characters.
> - Characters in the range `A-Z` represent a column.
> - The character `-` represents an aisle between the seats.
> - The character `#` represents an empty column, to denote there is are no seats in that column.
>
> For example, the column layout `ABC-DE-F#H` represents a layout where there are three columns to the left (`A`, `B`, `C`), an aisle, then two columns in the center (`D`, `E`), an aisle, and three columns to the right (`F`, `#`, `H`), with an empty column between columns `F` and `H`.

## Success Response - `200 OK`

```json
{
    "flightId": "<ID of the flight>",
    "aircraftModel": {
        "icaoCode": "<ICAO aircraft type designator code>",
        "iataCode": "<IATA aircraft type designator code>",
        "name": "<Model name of the aircraft>"
    },
    "seatMap": [
        {
            "cabinClass": "<Cabin class: E / B / F>",
            "startRow": "<Start row of the section>",
            "endRow": "<End row of the section>",
            "columnLayout": "<Column layout for this section, e.g. ABC-DE-F#H>"
        },
    ],
    "bookedSeats": [
        {
            "row": "<Row number of the booked seat>",
            "column": "<Column name of the booked seat>"
        },
    ]
}
```

Example:
```json
{
    "flightId": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
    "aircraftModel": {
        "icaoCode": "B789",
        "iataCode": "789",
        "name": "Boeing 787-9 Dreamliner"
    },
    "seatMap": [
        {
            "cabinClass": "F",
            "startRow": 1,
            "endRow": 8,
            "columnLayout": "A-DG-K"
        },
        {
            "cabinClass": "B",
            "startRow": 10,
            "endRow": 14,
            "columnLayout": "AC-DFG-HK"
        },
        {
            "cabinClass": "E",
            "startRow": 21,
            "endRow": 28,
            "columnLayout": "ABC-DFG-HJK"
        },
        {
            "cabinClass": "E",
            "startRow": 29,
            "endRow": 30,
            "columnLayout": "###-###-HJK"
        },
        {
            "cabinClass": "E",
            "startRow": 35,
            "endRow": 36,
            "columnLayout": "ABC-###-HJK"
        },
        {
            "cabinClass": "E",
            "startRow": 37,
            "endRow": 48,
            "columnLayout": "ABC-DFG-HJK"
        },
        {
            "cabinClass": "E",
            "startRow": 49,
            "endRow": 50,
            "columnLayout": "###-DFG-###"
        },
    ],
    "bookedSeats": [
        {
            "row": 5,
            "column": "A"
        },
        {
            "row": 12,
            "column": "G"
        },
        {
            "row": 42,
            "column": "J"
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
