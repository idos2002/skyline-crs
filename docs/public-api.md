# Public API

**Skyline CRS** exposes a json-based public REST API for external use.

> **Note:** To access protected endpoints make sure to log in first.

## Booking Management

|                       Link                        | Method | Endpoint                   | Description    |  Login Required  |
| :-----------------------------------------------: | :----: | -------------------------- | -------------- | :--------------: |
| [&#128279;](./services/booking/create-booking.md) | `POST` | `/booking`                 | Create booking |     &#10060;     |
|  [&#128279;](./services/booking/find-booking.md)  | `GET`  | `/booking/{pnrId}`         | Find booking   | &#10004;&#65039; |
| [&#128279;](./services/booking/update-booking.md) | `PUT`  | `/booking/{pnrId}`         | Update booking | &#10004;&#65039; |
| [&#128279;](./services/booking/cancel-booking.md) | `POST` | `/booking/{pnrId}/cancel`  | Cancel booking | &#10004;&#65039; |
|    [&#128279;](./services/booking/check-in.md)    | `POST` | `/booking/{pnrId}/checkIn` | Check in       | &#10004;&#65039; |

## Flights Information

|                         Link                          | Method | Endpoint                                          | Description        | Login Required |
| :---------------------------------------------------: | :----: | ------------------------------------------------- | ------------------ | :------------: |
|    [&#128279;](./services/flights/find-flights.md)    | `GET`  | `/flights/{origin}/{destination}/{departureDate}` | Find flights       |    &#10060;    |
| [&#128279;](./services/flights/get-flight-details.md) | `GET`  | `/flight/{flightId}`                              | Get flight details |    &#10060;    |
|  [&#128279;](./services/flights/get-flight-seats.md)  | `GET`  | `/flight/{flightId}/seats`                        | Get flight seats   |    &#10060;    |

## Login

|                  Link                   | Method | Endpoint | Description | Login Required |
| :-------------------------------------: | :----: | -------- | ----------- | :------------: |
| [&#128279;](./services/login/log-in.md) | `POST` | `/login` | Log in      |    &#10060;    |
