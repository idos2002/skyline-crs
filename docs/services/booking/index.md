# Booking Service

The **booking service** is responsible for managing the booking process. This service processes a booking request from a client and creates a corresponding PNR for the request, as well as verifying the data integrity of the request before adding the PNR to to database. The booking service is not responsible for the ticketing process, and only adds it to the ticketing queue to be ticketed when available.

## Features

- Create PNR and verify data for the requested booking, and adds the new PNR to the ticketing queue.
- Update existing bookings (PNRs).
- Get booking details (PNR data).
- Cancel booking.

## API

| Link                             | Method | Endpoint                   | Description        | Login Required   |
|:--------------------------------:|:------:| -------------------------- | ------------------ |:----------------:|
| [&#128279;](./get-booking.md)    | `GET`  | `/bookings/{pnrId}`        | Get booking        | &#10004;&#65039; |
| [&#128279;](./create-booking.md) | `POST` | `/bookings`                | Create new booking | &#10060;         |
| [&#128279;](./update-booking.md) | `PUT`  | `/bookings/{pnrId}`        | Update booking     | &#10004;&#65039; |
| [&#128279;](./cancel-booking.md) | `POST` | `/bookings/{pnrId}/cancel` | Cancel booking     | &#10004;&#65039; |
