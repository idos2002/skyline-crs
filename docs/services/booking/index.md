# Booking Service

The **booking service** is responsible for managing the booking and check-in process. This service processes
a booking request from a client and creates a corresponding PNR for the request, as well as verifying the
data integrity of the request before adding the PNR to to database.

The booking service is not responsible for the ticketing process, and only adds it to the ticketing queue
to be ticketed when available. It also queues emails to clients for corresponding actions.

## Features

- Create booking for a requested flight (also, queues the booking to be ticketed and to email a confirmation email).
- Get booking details.
- Update existing booking.
- Cancel booking (also, queues a cancellation confirmation email).
- Check in passengers of the booking (also, queues the boarding pass for the checked-in passengers to be emailed)

## API

|               Link               | Method | Endpoint                   | Description    |  Login Required  |
| :------------------------------: | :----: | -------------------------- | -------------- | :--------------: |
| [&#128279;](./create-booking.md) | `POST` | `/booking`                 | Create booking |     &#10060;     |
|  [&#128279;](./find-booking.md)  | `GET`  | `/booking/{pnrId}`         | Find booking   | &#10004;&#65039; |
| [&#128279;](./update-booking.md) | `PUT`  | `/booking/{pnrId}`         | Update booking | &#10004;&#65039; |
| [&#128279;](./cancel-booking.md) | `POST` | `/booking/{pnrId}/cancel`  | Cancel booking | &#10004;&#65039; |
|    [&#128279;](./check-in.md)    | `POST` | `/booking/{pnrId}/checkIn` | Check in       | &#10004;&#65039; |
