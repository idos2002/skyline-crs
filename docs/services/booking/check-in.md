# Check In

Check in all or some passengers of a booking (PNR) to their flight.
The check-in process may fail if the given details do not match those in the existing PNR (e.g. name, date of birth, etc.).

When checking in a passenger, a boarding pass will be issued for the passenger, and its information will, be accessible through
the find booking endpoint.

> **Warning!** This operation is irreversible and can only be done once!

> **Important:** Login is required to access this endpoint.

## Request

```http
POST /booking/{pnrId}/checkIn
```

| Parameter | Description                                             | Format      |
| --------- | ------------------------------------------------------- | ----------- |
| `{pnrId}` | The PNR ID (booking number) of the booking to check in. | UUID string |

Example:

```http
POST /booking/f362846f-679d-4ef7-857d-e321c622cb41/checkIn
```

### Body

```json
{
  "passengers": [
    {
      "nameTitle": "<Passenger name title, e.g. Mr, Mrs, etc. (optional)>",
      "givenNames": "<Passenger given names (first name and middle names)>",
      "surname": "<Passenger surname (last name)>",
      "dateOfBirth": "<Passenger date of birth (in UTC ISO 8601 format)>",
      "gender": "<Passenger gender: male / female / other / unspecified>",
      "bookedSeatId": "<Booked seat ID of the passenger's seat in the flight in standard UUID format>",
      "passport": {
        "number": "<The passport number>",
        "expirationDate": "<The expiration date of the passport>",
        "countryIssued": "<The ISO 3166-1 alpha-2 country code of the country that issued this passport>"
      }
    }
  ]
}
```

Example:

```json
{
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
      }
    },
    {
      "nameTitle": "Mrs",
      "givenNames": "Jane",
      "surname": "Doe",
      "dateOfBirth": "2002-01-01T00:00:00.000Z",
      "gender": "female",
      "bookedSeatId": "2edb1071-f3ab-4754-b40f-38616e2b8060",
      "passport": {
        "number": "87654321",
        "expirationDate": "2024-06-01T00:00:00.000Z",
        "countryIssued": "IL"
      }
    }
  ]
}
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
        "number": "<The passport number>",
        "expirationDate": "<The expiration date of the passport>",
        "countryIssued": "<The ISO 3166-1 alpha-2 country code of the country that issued this passport>"
      },
      "checkInTimestamp": "<Check-in timestamp for this passenger>"
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
    "status": "<Ticketing status: issued>",
    "issueTimestamp": "<Ticket issue timestamp>"
  },
  "createdTimestamp": "<PNR creation timestamp>",
  "updatesTimestamps": ["<PNR updates timestamps (optional)>"]
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
      "bookedSeatId": "2edb1071-f3ab-4754-b40f-38616e2b8060",
      "passport": {
        "number": "87654321",
        "expirationDate": "2024-06-01T00:00:00.000Z",
        "countryIssued": "IL"
      },
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

## Booking Not Ticketed Response - `409 Conflict`

```json
{
  "error": "Booking not ticketed",
  "message": "Could not check in for a booking that has not been ticketed."
}
```

## Check-in Validation Error Response - `409 Conflict`

```json
{
  "error": "Check-in validation error",
  "message": "Check-in passenger details do not match those of the booking.",
  "details": [
    {
      "cause": "<The part of the request that caused the error>",
      "message": "Passenger details do not match the booking"
    }
  ]
}
```

Example:

```json
{
  "error": "Check-in validation error",
  "message": "Check-in passenger details do not match those of the booking.",
  "details": [
    {
      "cause": "body/passengers/0",
      "message": "Passenger details do not match the booking"
    }
  ]
}
```

## Passenger Already Checked-in Response - `409 Conflict`

```json
{
  "error": "Passenger already checked-in",
  "message": "One of the passengers has already checked in.",
  "details": [
    {
      "cause": "<The part of the request that caused the error>",
      "message": "Passenger is already checked-in"
    }
  ]
}
```

Example:

```json
{
  "error": "Passenger already checked-in",
  "message": "One of the passengers has already checked in.",
  "details": [
    {
      "cause": "body/passengers/0",
      "message": "Passenger is already checked-in"
    }
  ]
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
