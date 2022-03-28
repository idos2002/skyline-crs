# Booking Service

The booking service is responsible for managing the booking and check-in process. This service processes a booking request from a client and creates a corresponding PNR for the request, as well as verifying the data integrity of the request before adding the PNR to to database.

The booking service is not responsible for the ticketing process, and only adds it to the ticketing queue to be ticketed when available. It also queues emails to clients for corresponding actions.

## Features

- Create booking for a requested flight (also, queues the booking to be ticketed and to email a confirmation email).
- Get booking details.
- Update existing booking.
- Cancel booking (also, queues a cancellation confirmation email).
- Check in passengers of the booking (also, queues the boarding pass for the checked-in passengers to be emailed)

## Usage

This is a [Docker](https://www.docker.com/) based [Node.js](https://nodejs.dev/) project, therefore it should be run in a container.

### Using Docker Compose

To run this service locally, along with its dependencies, [Docker Compose](https://github.com/docker/compose) may be used.

Navigate to the root [Skyline CRS](https://github.com/idos2002/skyline-crs) directory and run:

```
docker-compose up -d --build
```

This will run the entire Skyline CRS system locally using Docker Compose. You may modify `docker-compose.yml` to your liking, along with its respective `.env` file.

### Using Docker

To build the image directly, navigate to the project's directory and run:

```
docker build -t skyline-booking .
```

And to run the image in a new container run:

```
docker run -dp 80:80 \
  -e SKYLINE_ACCESS_TOKEN_SECRET=<Access token secret> \
  -e SKYLINE_INVENTORY_MANAGER_URL=<Inventory manager URL> \
  -e SKYLINE_PNR_DB_URI=<PNR database URI> \
  -e SKYLINE_RABBITMQ_URI=<RabbitMQ URI> \
  -e SKYLINE_TICKET_EXCHANGE_NAME=<Ticket exchange name> \
  -e SKYLINE_EMAIL_EXCHANGE_NAME=<Email exchange name> \
  skyline-booking
```

Note that this service depends on three other services:

- [Inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) - Used to retrieve flights data and manage booked seats.
- [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) - Used to store and manage bookings (PNRs).
- [RabbitMQ](https://www.rabbitmq.com/) - Used by Skyline CRS to manage queues. It is used for queueing bookings for ticketing and queueing emails.

## API Documentation

The service's API is documented at [the Skyline CRS documentation](https://idos2002.github.io/skyline-crs/services/booking/).

If the service is up and running, there is an interactive API documentation UI, which uses [Swagger UI](https://swagger.io/tools/swagger-ui/), and is accessible at the `/docs` endpoint of the service.

## Environment Variables

The service is configured using environment variables. Note that some environment variables are required, and the image will not run without them.

### `SKYLINE_ACCESS_TOKEN_SECRET` (Required)

The secret to use for signing the generated JWT access tokens.

### `SKYLINE_INVENTORY_MANAGER_URL` (Required)

[Inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) URL to query the flights information from and manage booked seats.  
Example values:

- `http://localhost:8080/v1/graphql`
- `http://inventory-manager/v1/graphql`

### `SKYLINE_RABBITMQ_URI` (Required)

URI to the [RabbitMQ](https://www.rabbitmq.com/) service/cluster to use for queueing bookings for ticketing and emails. The URI _should_ contain the vhost to connect to.  
Example values:

- `amqp://username:password@localhost:5672/skyline`
- `amqp://username:password@pnr:5672/skyline`

### `SKYLINE_TICKET_EXCHANGE_NAME` (Required)

The name of the RabbitMQ ticket exchange. This exchange should be a topic exchange.  
Example value: `ticket`.

### `SKYLINE_EMAIL_EXCHANGE_NAME` (Required)

The name of the RabbitMQ email exchange. This exchange should be a topic exchange.  
Example value: `email`.

### `SKYLINE_PNR_DB_URI` (Required)

The [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) MongoDB URI for managing the bookings' PNRs.  
Example values:

- `mongodb://username:password@localhost:27017`
- `mongodb://username:password@pnr:27017`

### `SKYLINE_PNR_DB_NAME`

The name of the PNR database for the given database URL.  
**Default:** `pnr`.

### `SKYLINE_PNR_DB_COLLECTION_NAME`

The name of the PNR database's PNR collection for the given database URL.  
**Default:** `pnrs`.

### `SKYLINE_TICKET_BOOKING_ROUTING_KEY`

The routing key to use for queueing bookings to be ticketed using the RabbitMQ ticket exchange.  
**Default:** `ticket.booking`.

### `SKYLINE_EMAIL_BOOKING_CONFIRMATION_ROUTING_KEY`

The routing key to use for queueing confirmation emails using the RabbitMQ email exchange.  
**Default:** `email.booking.confirmation`

### `SKYLINE_EMAIL_BOOKING_CANCELLATION_ROUTING_KEY`

The routing key to use for queueing cancellation confirmation emails using the RabbitMQ email exchange.  
**Default:** `email.booking.cancel`

### `SKYLINE_EMAIL_BOARDING_PASS_ROUTING_KEY`

The routing key to use for queueing boarding pass emails using the RabbitMQ email exchange.  
**Default:** `email.boarding.ticket`

### `SKYLINE_PORT`

The TCP port for the service to listen on for incoming requests.  
**Default:** `80`.

### `SKYLINE_LOG_LEVEL`

Log level of the service. Available values are: `TRACE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, `FATAL`.  
**Default:** `INFO`.

## Development

This project uses TypeScript and is based on the Node.js framework [Express](http://expressjs.com/). Since the project is Docker based, it is not required to install Node.js on the system, but it is **highly recommended** for local development.

### Requirements

- Node.js version `16.14.x` (LTS).
- A running instance of [inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) along with its dependencies.
- A running instance of the [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) along with its dependencies.
- An available instance or cluster of [RabbitMQ](https://www.rabbitmq.com/).

### Installation

To install all dependencies, navigate to the project's directory and run:

```
npm install
```

If you would like to validate and not modify the contents of `package-lock.json`, run:

```
npm ci
```

### Running Locally

In order to run the project locally, make sure to first set all required environment variables for the current shell session.

To start the development server locally using `ts-node`, make sure you are inside the project's directory and run:

```
npm start
```

To start the development server in watch mode, run instead:

```
npm run start:dev
```

This will watch for file changes and restart the server accordingly.

Since the project uses [bunyan](https://www.npmjs.com/package/bunyan) as the logging library, to print the JSON logs in a human-readable manner, use the following command:

```
npm start | npx bunyan
```

This also works with `start:dev`, etc. For more information about bunyan's CLI, see the documentation for the package.

### Tools

The project uses multiple tools to assure code quality and correctness. It is required to use these tools to ensure code quality before any commit!

- [Prettier](https://prettier.io/) - Prettier is an opinionated code formatter with support for: JavaScript (including experimental features), TypeScript, JSON etc. It removes all original styling and ensures that all outputted code conforms to a consistent style.  
  Usage: `npm run format`
- [ESLint](https://eslint.org/) - ESLint is an open source JavaScript linting utility, which also supports TypeScript.  
  Usage: `npm run lint`
- [Jest](https://jestjs.io/) - The testing framework used for the project.  
  Usage:
  - `npm test` - Unit tests or specs.
  - `npm run test:e2e` - End-to-end tests.
