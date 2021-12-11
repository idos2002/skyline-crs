# Update Booking

Update the booking with the requested PNR ID. Optional fields omitted previously may be added to the booking through this operation. May fail if the given PNR details are invalid or if all or some of the passengers have already checked in for the flight.

> **Important:**  Login is required to access this endpoint.

> **Note:** An updated ticket will be issued for this update.

### Restrictions and Warnings

- Passenger's list must have the same length as in the existing PNR - the client may not add passengers for an existing booking!
- The passengers will be updated (replaced) according to their order in the request.

## Request

```http
PUT /bookings/{pnrId}
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
        },
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
            "gender": "<Passenger gender: male / female / other / unspecified>"
        },
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
    "updatesTimestamps": [
        "<PNR updates timestamps (optional)>",
    ]
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
            "gender": "male"
        },
        {
            "nameTitle": "Mrs",
            "givenNames": "Jane",
            "surname": "Doe",
            "dateOfBirth": "2002-01-01T00:00:00.000Z",
            "gender": "female"
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
        "status": "pending",
        "issueTimestamp": "2020-10-11T22:58:43.236672Z"
    },
    "createdTimestamp": "2020-10-10T14:23:05.659711Z",
    "updatesTimestamps": [
        "2020-10-16T20:41:07.364729Z",
    ]
}
```

## Invalid PNR Response - `400 Bad Request`

```json
{
    "error": "Invalid PNR",
    "message": "The provided PNR data is invalid or is not in a correct form.",
    "details": [
        {
            "cause": "<Path to the property that caused the error>",
            "message": "<Specific error message>"
        },
    ]
}
```

Example:
```json
{
    "error": "Invalid PNR",
    "message": "The provided PNR data is invalid or is not in a correct form.",
    "details": [
        {
            "cause": "/passengers/0/gender",
            "message": "The passengers' gender must be one of the following: male, female, other, unspecified"
        },
    ]
}
```

## Unauthorized Access Response - `401 Unauthorized`

```json
{
    "error": "Unauthorized access",
    "message": "The access_token cookie is missing or invalid. Please log in first."
}
```

## Flight Not Found Response - `404 Not Found`

```json
{
    "error": "Flight not found",
    "message": "Could not find flight with the requested flight ID."
}
```

## Invalid Update Response - `409 Conflict`

In the case the length of passengers list does not match the one of the existing PNR (passengers were added or removed from the list):
```json
{
    "error": "Invalid update",
    "message": "Passenger additions or removals are not allowed."
}
```

In the case the booking has been canceled:
```json
{
    "error": "Invalid update",
    "message": "Booking has been canceled."
}
```

In the case some or all of the passengers have already checked in:
```json
{
    "error": "Invalid update",
    "message": "All or some of the passengers have already check in."
}
```
