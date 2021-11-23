# Create New Booking

Creates a new booking for the requested booking details. May fail if not enough seats are available or if the given PNR details are invalid.

## Request

```http
POST /bookings
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
        "status": "pending",
    },
    "createdTimestamp": "2020-10-10T14:23:05.659711Z",
}
```

## Invalid PNR Response - `400 Bad Request`

```json
{
    "error": "Invalid PNR",
    "message": "The provided PNR data is invalid.",
    "details": [
        {
            "cause": "<Property that caused the error>",
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
            "cause": "passengers[0].gender",
            "message": "The passengers' gender must be one of the following: male, female, other, unspecified."
        },
    ]
}
```

## Flight Not Available Response - `404 Not Found`

```json
{
    "error": "Flight not available",
    "message": "Could not book for flight with the requested flight ID."
}
```

> **Note:** This response is valid for cases where the flight does not have enough seats available, as well as cases where there couldn't be found any flight with the requested flight ID.
