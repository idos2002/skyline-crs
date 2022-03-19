# Find Booking

Gets the booking with the requested PNR ID.

> **Important:** Login is required to access this endpoint.

## Request

```http
GET /booking/{pnrId}
```

| Parameter | Description                                           | Format      |
| --------- | ----------------------------------------------------- | ----------- |
| `{pnrId}` | The PNR ID (booking number) of the requested booking. | UUID string |

Example:

```http
GET /bookings/f362846f-679d-4ef7-857d-e321c622cb41
```

## Success Response - `200 OK`

```json
{
  "id": "<PNR ID of the booking>",
  "passengers": [
    {
      "nameTitle": "<Passenger name title, e.g. Mr, Mrs, etc. (optional)>",
      "givenNames": "<Passenger given names (first name and middle names)>",
      "surname": "<Passenger surname (last name)>",
      "dateOfBirth": "<Passenger date of birth (in UTC ISO 8601 format)>",
      "gender": "<Passenger gender: male / female / other / unspecified>",
      "bookedSeatId": "<Booked seat ID of the passenger's seat in the flight in standard UUID format>",
      "passport": {
        "number": "<The passport number (optional)>",
        "expirationDate": "<The expiration date of the passport (optional)>",
        "countryIssued": "<The ISO 3166-1 alpha-2 country code of the country that issued this passport (optional)>"
      },
      "checkInTimestamp": "<Check-in timestamp for this passenger (optional)>",
      "boardingTimestamp": "<Plane boarding timestamp for this passenger (optional)>"
    }
  ],
  "flightId": "<Flight ID>",
  "contact": {
    "firstName": "<First name of the person who made the booking>",
    "surname": "<Surname of the person who made the booking>",
    "email": "<Contact email address>",
    "phone": "<Contact international phone number>",
    "address": {
      "countryCode": "<Contact address ISO 3166-1 alpha-2 country code>",
      "subdivisionCode": "<Contact address ISO 3166-2 subdivision code (optional)>",
      "city": "<Contact address city>",
      "street": "<Contact address street name>",
      "houseNumber": "<Contact address house number>",
      "postalCode": "<Contact address postal code>"
    }
  },
  "ticket": {
    "status": "<Ticketing status: pending / issued / canceled>",
    "issueTimestamp": "<Ticket issue timestamp (optional)>"
  },
  "createdTimestamp": "<PNR creation timestamp>",
  "updatesTimestamps": ["<PNR updates timestamps (optional)>"],
  "cancelTimestamp": "<PNR cancellation timestamp (optional)>"
}
```

Example:

```json
{
  "id": "f362846f-679d-4ef7-857d-e321c622cb41",
  "passengers": [
    {
      "nameTitle": "Mr",
      "givenNames": "John Albert",
      "surname": "Doe",
      "dateOfBirth": "2000-01-01T00:00:00.000Z",
      "gender": "male",
      "bookedSeatId": "2dc2ad2b-23ea-429a-bcf9-a462d0e42806",
      "passport": {
        "number": "12345678",
        "expirationDate": "2022-01-01T00:00:00.000Z",
        "countryIssued": "IL"
      },
      "checkInTimestamp": "2020-10-20T02:15:54.659720Z"
    },
    {
      "nameTitle": "Mrs",
      "givenNames": "Jane",
      "surname": "Doe",
      "dateOfBirth": "2002-01-01T00:00:00.000Z",
      "gender": "female",
      "passport": {
        "number": "87654321",
        "expirationDate": "2024-06-01T00:00:00.000Z",
        "countryIssued": "IL"
      },
      "bookedSeatId": "2edb1071-f3ab-4754-b40f-38616e2b8060",
      "checkInTimestamp": "2020-10-20T02:15:54.659720Z"
    }
  ],
  "flightId": "17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
  "contact": {
    "firstName": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "phone": "+972541234567",
    "address": {
      "countryCode": "IL",
      "city": "Tel Aviv-Yafo",
      "street": "Shlomo Rd.",
      "houseNumber": "136",
      "postalCode": "6603248"
    }
  },
  "ticket": {
    "status": "issued",
    "issueTimestamp": "2020-10-11T22:58:43.236672Z"
  },
  "createdTimestamp": "2020-10-10T14:23:05.659711Z",
  "updatesTimestamps": ["2020-10-17T07:31:01.678945Z"]
}
```

## Unauthorized Access Response - `401 Unauthorized`

```json
{
  "error": "Unauthorized access",
  "message": "The Authorization header is missing or invalid."
}
```

## Booking Not Found Response - `404 Not Found`

```json
{
  "error": "Booking not found",
  "message": "Could not find a booking with the given PNR ID."
}
```

## Validation Error - `422 Unprocessable Entity`

```json
{
  "error": "Validation error",
  "message": "Request has an invalid format.",
  "details": [
    {
      "cause": "<The part of the request that caused the error>",
      "message": "<Explanation about the error>"
    }
  ]
}
```

Example:

```json
{
  "error": "Validation error",
  "message": "Request has an invalid format.",
  "details": [
    {
      "cause": "path/id",
      "message": "id must be a UUID"
    }
  ]
}
```
