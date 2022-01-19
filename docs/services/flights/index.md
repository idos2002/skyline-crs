# Flights Service

The **flights service** presents an external API for the inventory, which contains all of the flights information.

## Features

- Get a list of all available flights for from the origin to the destination.
- Get details about specific flights.
- Get flight seats and seat maps.

## API

| Link                                 | Method | Endpoint                                          | Description        | Login Required |
|:------------------------------------:|:------:| ------------------------------------------------- | ------------------ |:--------------:|
| [&#128279;](./find-flights.md)       | `GET`  | `/flights/{origin}/{destination}/{departureDate}` | Find flights       | &#10060;       |
| [&#128279;](./get-flight-details.md) | `GET`  | `/flight/{flightId}`                              | Get flight details | &#10060;       |
| [&#128279;](./get-flight-seats.md)   | `GET`  | `/flight/{flightId}/seats`                        | Get flight seats   | &#10060;       |
