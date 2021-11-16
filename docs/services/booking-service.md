# Booking Service

The **booking service** is responsible for managing the booking process. This service processes a booking request from a client and creates a corresponding PNR for the request, as well as verifying the data integrity of the request before adding the PNR to to database. The booking service is not responsible for the ticketing process, and only adds it to the ticketing queue to be ticketed when available.

## Features

* Create PNR for the requested itinerary and store in database.
* Add PNR to ticketing queue.
* Make updates to existing PNRs.
* Retrieve booking status (from PNR data) to client.

## API

### `GET /booking/{pnrId}`
