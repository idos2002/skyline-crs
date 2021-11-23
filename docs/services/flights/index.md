# Flights Service

The **flights service** presents an external API for the inventory, which contains all the flights information.

## Features

- Get a list of all available flights under the requested conditions and boundaries, with support for pagination.
- Get details about specific flights.
- Get flight seats and seat maps.

## API

| Link                                 | Method | Endpoint                                          | Description        |
|:------------------------------------:|:------:| ------------------------------------------------- | ------------------ |
| [&#128279;](./find-flights.md)       | `GET`  | `/flights/{origin}/{destination}/{departureDate}` | Find flights       |
| [&#128279;](./get-flight-details.md) | `GET`  | `/flights/{flightId}`                             | Get flight details |
| [&#128279;](./get-flight-seats.md)   | `GET`  | `/flights/{flightId}/seats`                       | Get flight seats   |
