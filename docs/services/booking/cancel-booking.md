# Cancel Booking

Cancels the booking with the requested PNR ID. A booking **cannot be canceled** if all or some of the passengers have already checked in for the flight!

> **Warning!** This operation is irreversible and can only be done once!

> **Important:**  Login is required to access this endpoint.

> **Note:** Canceled PNRs will be archived and will not be accessible through this API thereafter.

## Request

```http
POST /bookings/{pnrId}/cancel
```

| Parameter | Description                                           | Format      |
| --------- | ----------------------------------------------------- | ----------- |
| `{pnrId}` | The PNR ID (booking number) of the booking to cancel. | UUID string |

Example:
```http
POST /bookings/f362846f-679d-4ef7-857d-e321c622cb41/cancel
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
            "countryCode": "<Contact address ISO 3166-1 alpha-2 country code>",
            "subdivisionCode": "<Contact address ISO 3166-2 subdivision code (optional)>",
            "city": "<Contact address city>",
            "street": "<Contact address street name>",
            "houseNumber": "<Contact address house number>",
            "postalCode": "<Contact address postal code>"
        }
    },
    "ticket": {
        "status": "canceled",
        "issueTimestamp": "<Ticket issue timestamp (optional)>"
    },
    "createdTimestamp": "<PNR creation timestamp>",
    "updatesTimestamps": [
        "<PNR updates timestamps (optional)>",
    ],
    "cancelTimestamp": "<PNR cancellation timestamp (optional)>",
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
        "status": "canceled",
        "issueTimestamp": "2020-10-11T22:58:43.236672Z"
    },
    "createdTimestamp": "2020-10-10T14:23:05.659711Z",
    "updatesTimestamps": [
        "2020-10-17T07:31:01.678945Z"
    ],
    "cancelTimestamp": "2020-10-20T02:15:54.659720Z"
}
```

## Unauthorized Access Response - `401 Unauthorized`

```json
{
    "error": "Unauthorized access",
    "message": "The access_token cookie is missing or invalid. Please log in first."
}
```

## Booking Not Found Response - `404 Not Found`

```json
{
    "error": "Booking not found",
    "message": "Could not find a booking with the given PNR ID."
}
```

## Booking Already Canceled Response - `409 Conflict`

```json
{
    "error": "Booking already canceled",
    "message": "Could not cancel a booking which is already canceled."
}
```

## Already Checked In Response - `409 Conflict`

```json
{
    "error": "Already checked in",
    "message": "Could not cancel a booking which all or some of its passengers have already checked in."
}
```
