# Update Booking

Update the booking with the requested PNR ID. Optional fields omitted previously may be added to the booking through this operation. May fail if the given PNR details are invalid or if all or some of the passengers have already checked in for the flight.

> **Important:** Login is required to access this endpoint.

> **Note:** An updated ticket will be issued for this update.

### Restrictions and Warnings

- Passenger's list must have the same length as in the existing PNR - the client may not add passengers for an existing booking!
- The passengers will be updated (replaced) according to their order in the request.

## Request

```http
PUT /booking/{pnrId}
```

| Parameter | Description                                           | Format      |
| --------- | ----------------------------------------------------- | ----------- |
| `{pnrId}` | The PNR ID (booking number) of the booking to update. | UUID string |

Example:

```http
PUT /bookings/f362846f-679d-4ef7-857d-e321c622cb41
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
      "gender": "<Passenger gender: male / female / other / unspecified>"
    }
  ],
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
  }
}
```

Example:

```json
{
  "passengers": [
    {
      "nameTitle": "Mr",
      "givenNames": "Josh Daniel",
      "surname": "Doe",
      "dateOfBirth": "2000-01-01T00:00:00.000Z",
      "gender": "male"
    },
    {
      "nameTitle": "Mrs",
      "givenNames": "Jane",
      "surname": "Doe",
      "dateOfBirth": "2002-06-01T00:00:00.000Z",
      "gender": "female"
    }
  ],
  "contact": {
    "firstName": "Josh",
    "surname": "Doe",
    "email": "john.doe.updated@example.com",
    "phone": "+972547654321",
    "address": {
      "countryCode": "IL",
      "city": "Tel Aviv-Yafo",
      "street": "Shlomo Rd.",
      "houseNumber": "136",
      "postalCode": "6603248"
    }
  }
}
```

## Success Response - `200 OK`

```json
{
  "id": "<PNR ID of the updated booking>",
  "passengers": [
    {
      "nameTitle": "<Passenger name title, e.g. Mr, Mrs, etc. (optional)>",
      "givenNames": "<Passenger given names (first name and middle names)>",
      "surname": "<Passenger surname (last name)>",
      "dateOfBirth": "<Passenger date of birth (in UTC ISO 8601 format)>",
      "gender": "<Passenger gender: male / female / other / unspecified>",
      "bookedSeatId": "<Booked seat ID of the passenger's seat in the flight in standard UUID format>"
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
    "status": "pending",
    "issueTimestamp": "<Ticket issue timestamp (optional)>"
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
      "bookedSeatId": "e3bfa7ae-a03b-11ec-a75d-0242ac120002"
    },
    {
      "nameTitle": "Mrs",
      "givenNames": "Jane",
      "surname": "Doe",
      "dateOfBirth": "2002-01-01T00:00:00.000Z",
      "gender": "female",
      "bookedSeatId": "0509d3a3-5ce1-437d-b4b4-b971aa2c0657"
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
    "status": "pending"
  },
  "createdTimestamp": "2020-10-10T14:23:05.659711Z",
  "updatesTimestamps": ["2020-10-16T20:41:07.364729Z"]
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

## Passenger Count Change - `409 Conflict`

In the case the number of passengers in the request body does not match the number of
passengers in the booking.

```json
{
  "error": "Passenger count change",
  "message": "Passenger additions or removals are not allowed."
}
```

## Already Checked In - `409 Conflict`

```json
{
  "error": "Already checked in",
  "message": "Could not update or cancel a booking which all or some of its passengers have already checked in."
}
```

## Booking Already Canceled - `409 Conflict`

```json
{
  "error": "Booking already canceled",
  "message": "Could not update or cancel a booking which is already canceled."
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
