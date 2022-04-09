# Ticketing Service

The ticketing service is responsible for managing the ticketing process of new bookings. This service consumes ticketing messages from RabbitMQ of bookings to ticket,
and in return updates the corresponding booking in the PNR database accordingly. The service also queues the flight tickets for the booking to be emailed.

## Features

- Consumes ticketing messages from RabbitMQ.
- Updates ticketed bookings in the PNR database.
- Queues the flight tickets to be emailed.

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
docker build -t skyline-ticketing .
```

And to run the image in a new container run:

```
docker run -dp 80:80 \
  -e SKYLINE_RABBITMQ_URI=<RabbitMQ URI> \
  -e SKYLINE_TICKET_EXCHANGE_NAME=<Ticket exchange name> \
  -e SKYLINE_TICKET_QUEUE_NAME=<Ticket queue name> \
  -e SKYLINE_TICKET_BOOKING_BINDING_KEY=<Ticket booking binding key> \
  -e SKYLINE_EMAIL_EXCHANGE_NAME=<Email exchange name> \
  -e SKYLINE_DEAD_LETTER_EXCHANGE_NAME=<Dead letter exchange name> \
  -e SKYLINE_PNR_DB_URI=<PNR database URI> \
  skyline-ticketing
```

Note that this service depends on two other services:

- [RabbitMQ](https://www.rabbitmq.com/) - Used by Skyline CRS to manage queues. It is used to consume ticketing messages and queue tickets to be emailed.
- [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) - Used to read and update booking (PNR) details when ticketing.

## Environment Variables

The service is configured using environment variables. Note that some environment variables are required, and the image will not run without them.

### `SKYLINE_RABBITMQ_URI` (Required)

URI to the [RabbitMQ](https://www.rabbitmq.com/) service/cluster to use for consuming the ticket queue and queuing flight ticket to be emailed. The URI _should_ contain the vhost to connect to.  
Example values:

- `amqp://username:password@localhost:5672/skyline`
- `amqp://username:password@pnr:5672/skyline`

### `SKYLINE_TICKET_EXCHANGE_NAME` (Required)

The name of the RabbitMQ ticket exchange. This exchange should be a topic exchange.  
Example value: `ticket`.

### `SKYLINE_TICKET_QUEUE_NAME` (Required)

The name of the RabbitMQ ticket queue. This queue should be a durable queue with a dead letter exchange and routing key, as given by `SKYLINE_DEAD_LETTER_EXCHANGE_NAME` and `SKYLINE_DEAD_LETTER_ROUTING_KEY`.  
Example value: `ticket`.

### `SKYLINE_TICKET_BOOKING_BINDING_KEY` (Required)

The binding key of the RabbitMQ ticket exchange and the ticket queue.  
Example value: `ticket.#`.

### `SKYLINE_EMAIL_EXCHANGE_NAME` (Required)

The name of the RabbitMQ email exchange. This exchange should be a topic exchange.  
Example value: `email`.

### `SKYLINE_DEAD_LETTER_EXCHANGE_NAME` (Required)

The name of the RabbitMQ [dead letter exchange](https://www.rabbitmq.com/dlx.html) for the ticket queue. This exchange should be a topic exchange.  
Example value: `dlx`.

### `SKYLINE_PNR_DB_URI` (Required)

The [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) MongoDB URI for updating the bookings' PNRs.  
Example values:

- `mongodb://username:password@localhost:27017`
- `mongodb://username:password@pnr:27017`

### `SKYLINE_PNR_DB_NAME`

The name of the PNR database for the given database URL.  
**Default:** `pnr`.

### `SKYLINE_PNR_DB_COLLECTION_NAME`

The name of the PNR database's PNR collection for the given database URL.  
**Default:** `pnrs`.

### `SKYLINE_PREFETCH_COUNT`

The RabbitMQ [consumer prefetch count](https://www.rabbitmq.com/consumer-prefetch.html) to use for this service, when consuming from the given ticket queue. For more information, see: [How to Optimize the RabbitMQ Prefetch Count](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html).  
**Default:** `1`.

### `SKYLINE_TICKET_BOOKING_MESSAGE_TYPE`

The message type for ticketing messages in the given ticket queue.  
**Default:** `ticket.booking`.

### `SKYLINE_EMAIL_TICKET_ROUTING_KEY`

The routing key to use for queueing the flight tickets to be emailed through the RabbitMQ email exchange.  
**Default:** `email.booking.ticket`

### `SKYLINE_DEAD_LETTER_ROUTING_KEY`

The routing key to use for [dead-lettered messages](https://www.rabbitmq.com/dlx.html) of the ticket queue.
**Default:** `ticket.booking`

### `SKYLINE_LOG_LEVEL`

Log level of the service. Available values are: `TRACE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, `FATAL`.  
**Default:** `INFO`.

## Development

This project uses TypeScript and uses [amqplib](https://www.npmjs.com/package/amqplib) for consuming messages from the ticket queue. Since the project is Docker based, it is not required to install Node.js on the system, but it is **highly recommended** for local development.

### Requirements

- Node.js version `16.14.x` (LTS).
- An available instance or cluster of [RabbitMQ](https://www.rabbitmq.com/).
- A running instance of the [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) along with its dependencies.

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
