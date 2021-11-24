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

## Success Response - `200 OK`

```json
{
    "flightId": "<ID of the flight>",
    "seatMap": {
        "planeModelNumber": "<Plane model number>",
        "planeModelName": "<Plane model name>",
        "cabins": [
            {
                "cabinClass": "<Cabin class: E / B / F>",
                "startRow": "<Start row of the cabin>",
                "endRow": "<End row of the cabin>",
                "columnLayout": "<Column layout for this cabin, e.g. ABC-DE-FGH>"
            }
        ]
    },
    "bookedSeats": [
        {
            "row": "<Row number of the booked seat>",
            "column": "<Column number of the booked seat>"
        },
    ]
}
```

Example:
```json
{
    "flightId": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
    "seatMap": {
        "planeModelNumber": "B789",
        "planeModelName": "Boeing 787-9 Dreamliner",
        "cabins": [
            {
                "cabinClass": "F",
                "startRow": "1",
                "endRow": "8",
                "columnLayout": "A-DG-K"
            },
            {
                "cabinClass": "B",
                "startRow": "10",
                "endRow": "14",
                "columnLayout": "AC-DFG-HK"
            },
            {
                "cabinClass": "E",
                "startRow": "21",
                "endRow": "28",
                "columnLayout": "ABC-DFG-HJK"
            },
            {
                "cabinClass": "E",
                "startRow": "29",
                "endRow": "30",
                "columnLayout": "--------HJK"
            },
            {
                "cabinClass": "E",
                "startRow": "35",
                "endRow": "36",
                "columnLayout": "ABC-----HJK"
            },
            {
                "cabinClass": "E",
                "startRow": "37",
                "endRow": "48",
                "columnLayout": "ABC-DFG-HJK"
            },
            {
                "cabinClass": "E",
                "startRow": "49",
                "endRow": "50",
                "columnLayout": "----DFG----"
            },
        ]
    },
    "bookedSeats": [
        {
            "row": "5",
            "column": "A"
        },
        {
            "row": "12",
            "column": "G"
        },
        {
            "row": "42",
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
