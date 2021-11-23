# Get Booking

Gets the booking with the requested PNR ID. The first name and last name of the person who made the booking (as in the contact details of the corresponding PNR) are required in the request body for authentication purposes.

## Request

```http
GET /bookings/{pnrId}
```

| Parameter | Description                                           | Format      |
| --------- | ----------------------------------------------------- | ----------- |
| `{pnrId}` | The PNR ID (booking number) of the requested booking. | UUID string |

Example:
```http
GET /bookings/f362846f-679d-4ef7-857d-e321c622cb41
```

### Body

```json
{
    "authentication": {
        "firstName": "<First name of the person who made the booking>",
        "lastName": "<Last name of the person who made the booking>"
    }
}
```

Example:
```json
{
    "authentication": {
        "firstName": "John",
        "lastName": "Doe"
    }
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
            "country": "<Contact address country>",
            "administrativeDivision": "<Contact address administrative division, e.g. state, province, region, etc. (optional)>",
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
    "updatesTimestamps": [
        "<PNR updates timestamps (optional)>",
    ],
    "cancelTimestamp": "<PNR cancellation timestamp (optional)>",
    "checkInTimestamp": "<Check-in timestamp for this PNR (optional)>"
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
            "country": "Israel",
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
    "updatesTimestamps": [
        "2020-10-17T07:31:01.678945Z"
    ],
    "checkInTimestamp": "2020-10-20T02:15:54.659720Z"
}
```

## Unauthorized Access Response - `401 Unauthorized`

```json
{
    "error": "Unauthorized access",
    "message": "The provided first name and last name do not match the booking's contact details."
}
```

## Booking Not Found Response - `404 Not Found`

```json
{
    "error": "Booking not found",
    "message": "Could not find a booking with the given PNR ID."
}
```
