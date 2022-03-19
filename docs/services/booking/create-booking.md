# Create Booking

Creates a new booking for the requested booking details. May fail if not enough seats are available or if the given PNR details are invalid.

## Request

```http
POST /booking
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
      "seat": {
        "cabinClass": "<Cabin class of the seat to book: F / B / E>",
        "row": "<The row of the seat to book>",
        "column": "<The row of the seat to book>"
      }
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
  }
}
```

Example:

```json
{
  "passengers": [
    {
      "nameTitle": "Mr",
      "givenNames": "John Dan",
      "surname": "Doe",
      "dateOfBirth": "2000-01-01T00:00:00.000Z",
      "gender": "male",
      "seat": {
        "cabinClass": "F",
        "row": 4,
        "column": "A"
      }
    },
    {
      "nameTitle": "Mrs",
      "givenNames": "Jane",
      "surname": "Doe",
      "dateOfBirth": "2002-01-01T00:00:00.000Z",
      "gender": "female",
      "seat": {
        "cabinClass": "F",
        "row": 4,
        "column": "D"
      }
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
  }
}
```

## Success Response - `201 Created`

```json
{
  "id": "<PNR ID of the newly created booking>",
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
      "country": "<Contact address country>",
      "administrativeDivision": "<Contact address administrative division, e.g. state, province, region, etc. (optional)>",
      "city": "<Contact address city>",
      "street": "<Contact address street name>",
      "houseNumber": "<Contact address house number>",
      "postalCode": "<Contact address postal code>"
    }
  },
  "ticket": {
    "status": "pending"
  },
  "createdTimestamp": "<PNR creation timestamp>"
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
  "createdTimestamp": "2020-10-10T14:23:05.659711Z"
}
```

## Flight Not Found Response - `404 Not Found`

```json
{
  "error": "Flight not found",
  "message": "Could not find flight with the requested flight ID."
}
```

## Seats Not Available Response - `409 Conflict`

```json
{
  "error": "Seats not available",
  "message": "Could not book the requested seats, as they are already booked."
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
      "cause": "body/passengers/0/gender",
      "message": "gender must be a valid enum value"
    }
  ]
}
```
