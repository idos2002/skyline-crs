# Skyline CRS

**Skyline CRS** is a scalable computer reservation system (CRS) for a fictional airline called Skyline, built for the cloud. The project is deployed using [Docker](https://www.docker.com/) containers and also provides a basic [Kubernetes](https://kubernetes.io/) configuration.

The system exposes a public REST API and uses JWT token based authentication, hence allowing integration with other travel agencies.
There is also a web application for the airline, from which the clients may make all actions.

## Public API Documentation

The public API documentation is available [here](./public-api.md).

## Services Documentation

| Service                                        | Description                                                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [Booking Service](./services/booking/index.md) | Creates and manages flight bookings and manipulates the corresponding passenger name records (PNRs).  |
| [Flights Service](./services/flights/index.md) | Provides all of the flights related information (available flights, flight details, seat maps, etc.). |
| [Login Service](./services/login/index.md)     | Logs the client into the system using PNR credentials to access protected resources (e.g. bookings).  |
