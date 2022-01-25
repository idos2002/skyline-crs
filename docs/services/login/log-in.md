# Log In

Log in to Skyline CRS using the booking credentials to access protected endpoints.

## Authentication Process

1. The client sends an authentication request to the `/login` endpoint with the required credentials: PNR ID, first name and last name of the person who made the booking.

2. The login service will verify the credentials with the existing data.

3. If the credentials are correct, a JWT access token will be generated and sent in the response body, and will have a **30 minutes** expiration time. The JWT token will be signed using the HS256 (HMAC-SHA256) algorithm, and will have the following payload format:
    ```json
    {
        "sub": "<The PNR ID of this access token>",
        "iat": "<The unix time this token has been issued>",
        "exp": "<The unix time for this token to expire (30 minutes since issued)>",
    }
    ```
    Example payload (decoded):
    ```json
    {
        "sub": "f362846f-679d-4ef7-857d-e321c622cb41",
        "iat": "1639176300",
        "exp": "1639178100"
    }
    ```
    Using the secret `secret`, the following JWT token would be generated:
    ```
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMzYyODQ2Zi02NzlkLTRlZjctODU3ZC1lMzIxYzYyMmNiNDEiLCJpYXQiOiIxNjM5MTc2MzAwIiwiZXhwIjoiMTYzOTE3ODEwMCJ9.l1smQvKIIWZG6dLLopUrXsWs7cff8_SJQ0JYwB_sd9g
    ```

4. Then, for each request involving the authenticated booking, the access token will be supplied using the `Authorization` header  for authorization. Using an invalid or expired token would result in an error response of course, and would require the client to re-authenticate (starting from step 1 as seen above).

## Request

```http
POST /login
```

### Body

```json
{
    "pnrId": "<The PNR ID (booking number) of the requested booking>",
    "firstName": "<First name of the person who made the booking>",
    "surname": "<surname of the person who made the booking>"
}
```

Example:
```json
{
    "pnrId": "f362846f-679d-4ef7-857d-e321c622cb41",
    "firstName": "John",
    "surname": "Doe"
}
```

## Success Response - `200 OK`

```json
{
    "token": "<The JWT access token>"
}
```

Example:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMzYyODQ2Zi02NzlkLTRlZjctODU3ZC1lMzIxYzYyMmNiNDEiLCJpYXQiOiIxNjM5MTc2MzAwIiwiZXhwIjoiMTYzOTE3ODEwMCJ9.l1smQvKIIWZG6dLLopUrXsWs7cff8_SJQ0JYwB_sd9g"
}
```

## Log In Failed Response - `400 Bad Request`

```json
{
    "error": "Log in failed",
    "message": "Could not authenticate booking for the given PNR ID with the given first name and surname."
}
```

## Validation Error Response - `422 Unprocessable Entity`

```json
{
    "error": "Validation error",
    "message": "Request has an invalid format.",
    "details": [
        {
            "cause": "<Path to the missing credential>",
            "message": "<Specific error message>"
        },
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
            "cause": "surname",
            "message": "surname is missing."
        },
    ]
}
```
