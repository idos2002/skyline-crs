# Login Service

The **login service** is responsible for authenticating the client to access protected resources in the system, such as booking information.
The service has a single endpoint `/login`, where the authentication credentials are sent to for authentication.

## Authentication Process

1. The client sends an authentication request to the `/login` endpoint with the required credentials: PNR ID, first name and last name of the person who made the booking.

2. The login service will verify the credentials with the existing data.

3. If the credentials are correct, a JWT access token will be generated and sent as the HTTP cookie `access_token`, and will have a **30 minutes** expiration time. The JWT token will be signed using the HS256 (HMAC-SHA256) algorithm, and will have the following payload format:
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

4. Then, for each request involving the authenticated booking, the `access_token` cookie will be supplied for authorization. Using an invalid or expired token would result in an error response of course, and would require the client to re-authenticate (starting from step 1 as seen above).

## Request

```http
POST /login
```

### Body

```json
{
    "pnrId": "<The PNR ID (booking number) of the requested booking>",
    "firstName": "<First name of the person who made the booking>",
    "lastName": "<Last name of the person who made the booking>"
}
```

Example:
```json
{
    "pnrId": "f362846f-679d-4ef7-857d-e321c622cb41",
    "firstName": "John",
    "lastName": "Doe"
}
```

## Success Response - `200 OK`

### Set Cookies

```http
Set-Cookie: access_token=<Access token>; Max-Age=1800; SameSite=Strict; HttpOnly
```

Example:
```http
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMzYyODQ2Zi02NzlkLTRlZjctODU3ZC1lMzIxYzYyMmNiNDEiLCJpYXQiOiIxNjM5MTc2MzAwIiwiZXhwIjoiMTYzOTE3ODEwMCJ9.l1smQvKIIWZG6dLLopUrXsWs7cff8_SJQ0JYwB_sd9g; Max-Age=1800; SameSite=Strict; HttpOnly
```

## Missing Credentials Response - `400 Bad Request`

```json
{
    "error": "Missing credentials",
    "message": "Some credentials are missing in the request.",
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
    "error": "Missing credentials",
    "message": "Some credentials are missing in the request.",
    "details": [
        {
            "cause": "/lastName",
            "message": "Last name credential is missing."
        },
    ]
}
```

## Log In Failed Response - `401 Unauthorized`

```json
{
    "error": "Log in failed",
    "message": "Could not authenticate booking with the given PNR ID for the given first name and last name."
}
```
