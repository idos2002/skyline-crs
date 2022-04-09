# Email Service

The email service is responsible for sending emails to clients for related actions they took with Skyline CRS.
This service consumes email messages from RabbitMQ of different emails to send, and sends they corresponding email to the client according to the contact information of the client's booking.

## Features

- Consumes email messages from RabbitMQ.
- Sends booking confirmation emails.
- Sends flight ticket emails.
- Sends booking cancellation confirmation emails.
- Sends boarding pass emails.

## Usage

This is a [Docker](https://www.docker.com/) based [Node.js](https://nodejs.dev/) project, therefore it should be run in a container.

### Using Docker Compose

To run this service locally, along with its dependencies, [Docker Compose](https://github.com/docker/compose) may be used.

Navigate to the root [Skyline CRS](https://github.com/idos2002/skyline-crs) directory and run:

```
docker-compose up -d --build
```

This will run the entire Skyline CRS system locally using Docker Compose. You may modify `docker-compose.yml` to your liking, along with its respective `.env` file. Make sure to also create an `email.env.local` file as described in the Skyline CRS repository's `README` file.

### Using Docker

To build the image directly, navigate to the project's directory and run:

```
docker build -t skyline-email .
```

And to run the image in a new container run:

```
docker run -dp 80:80 \
  -e SKYLINE_RABBITMQ_URI=<RabbitMQ URI> \
  -e SKYLINE_EMAIL_EXCHANGE_NAME=<Email exchange name> \
  -e SKYLINE_EMAIL_QUEUE_NAME=<Email queue name> \
  -e SKYLINE_EMAIL_BINDING_KEY=<Email binding key> \
  -e SKYLINE_DEAD_LETTER_EXCHANGE_NAME=<Dead letter exchange name> \
  -e SKYLINE_PNR_DB_URI=<PNR database URI> \
  -e SKYLINE_INVENTORY_MANAGER_URL=<Inventory manager URL> \
  -e SKYLINE_EMAIL_ADDRESS=<From email address> \
  -e SKYLINE_SMTP_HOST=<SMTP server host name> \
  -e SKYLINE_SMTP_PORT=<SMTP server host name> \
  -e SKYLINE_SMTP_USERNAME=<SMTP server username> \
  -e SKYLINE_SMTP_PASSWORD=<SMTP server password> \
  skyline-ticketing
```

Note that this service depends on two other services:

- [RabbitMQ](https://www.rabbitmq.com/) - Used by Skyline CRS to manage queues. It is used to consume emailing messages.
- [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) - Used to read booking (PNR) details.
- [Inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) - Used to retrieve flights and booked seats data.

## Environment Variables

The service is configured using environment variables. Note that some environment variables are required, and the image will not run without them.

### `SKYLINE_RABBITMQ_URI` (Required)

URI to the [RabbitMQ](https://www.rabbitmq.com/) service/cluster to use for consuming the email queue. The URI _should_ contain the vhost to connect to.  
Example values:

- `amqp://username:password@localhost:5672/skyline`
- `amqp://username:password@pnr:5672/skyline`

### `SKYLINE_EMAIL_EXCHANGE_NAME` (Required)

The name of the RabbitMQ email exchange. This exchange should be a topic exchange.  
Example value: `email`.

### `SKYLINE_EMAIL_QUEUE_NAME` (Required)

The name of the RabbitMQ email queue. This queue should be a durable queue with a dead letter exchange and routing key, as given by `SKYLINE_DEAD_LETTER_EXCHANGE_NAME` and `SKYLINE_DEAD_LETTER_ROUTING_KEY`.  
Example value: `email`.

### `SKYLINE_EMAIL_BINDING_KEY` (Required)

The binding key of the RabbitMQ email exchange and the email queue.  
Example value: `email.#`.

### `SKYLINE_DEAD_LETTER_EXCHANGE_NAME` (Required)

The name of the RabbitMQ [dead letter exchange](https://www.rabbitmq.com/dlx.html) for the email queue. This exchange should be a topic exchange.  
Example value: `dlx`.

### `SKYLINE_INVENTORY_MANAGER_URL` (Required)

[Inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) URL to query the flights and booked seats information from.  
Example values:

- `http://localhost:8080/v1/graphql`
- `http://inventory-manager/v1/graphql`

### `SKYLINE_PNR_DB_URI` (Required)

The [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) MongoDB URI for reading the bookings' details.  
Example values:

- `mongodb://username:password@localhost:27017`
- `mongodb://username:password@pnr:27017`

### `SKYLINE_EMAIL_ADDRESS` (Required)

The email address to send emails from.  
Example value: `example@zohomail.com`.

### `SKYLINE_SMTP_HOST` (Required)<sup>1</sup>

The SMTP server host name or IP address to use for sending emails.  
Example value: `smtp.zoho.com`.

### `SKYLINE_SMTP_PORT` (Required)<sup>1</sup>

The SMTP server's port to use for sending emails.  
Example value: `465`.

### `SKYLINE_SMTP_USERNAME` (Required)<sup>1</sup>

The username to use for authenticating with the given SMTP server.
Example values:

- `example@zohomail.com`
- `username`

### `SKYLINE_SMTP_PASSWORD` (Required)<sup>1</sup>

The password to use for authenticating with the given SMTP server using the given username.
Example value: `password`.

### `SKYLINE_PNR_DB_NAME`

The name of the PNR database for the given database URL.  
**Default:** `pnr`.

### `SKYLINE_PNR_DB_COLLECTION_NAME`

The name of the PNR database's PNR collection for the given database URL.  
**Default:** `pnrs`.

### `SKYLINE_PREFETCH_COUNT`

The RabbitMQ [consumer prefetch count](https://www.rabbitmq.com/consumer-prefetch.html) to use for this service, when consuming from the given email queue. For more information, see: [How to Optimize the RabbitMQ Prefetch Count](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html).  
**Default:** `1`.

### `SKYLINE_EMAIL_BOOKING_CONFIRMATION_MESSAGE_TYPE`

The message type for booking confirmation emails in the given email queue.  
**Default:** `email.booking.confirmation`.

### `SKYLINE_EMAIL_FLIGHT_TICKET_MESSAGE_TYPE`

The message type for flights ticket emails in the given email queue.  
**Default:** `email.booking.ticket`.

### `SKYLINE_EMAIL_BOOKING_CANCELLATION_MESSAGE_TYPE`

The message type for booking cancellation confirmation emails in the given email queue.  
**Default:** `email.booking.cancel`.

### `SKYLINE_EMAIL_BOARDING_PASS_MESSAGE_TYPE`

The message type for boarding pass emails in the given email queue.  
**Default:** `email.boarding.ticket`.

### `SKYLINE_DEAD_LETTER_ROUTING_KEY`

The routing key to use for [dead-lettered messages](https://www.rabbitmq.com/dlx.html) of the email queue.
**Default:** `email.all`

### `SKYLINE_IATA_AIRLINE_CODE`

The Skyline IATA airline's code. Note that it must conform to the [IATA airline designator standard](https://en.wikipedia.org/wiki/Airline_codes#IATA_airline_designator).  
**Regex:** `/^[A-Z0-9]{2,3}$/`  
**Default:** `SK`

### `SKYLINE_LOG_LEVEL`

Log level of the service. Available values are: `TRACE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, `FATAL`.  
**Default:** `INFO`.

---

### Notes:

1. These environnement variables are generally required when running in a docker container (as the `NODE_ENV` environment variable is set to `production` in the service's `Dockerfile`). However, in local development, unless `NODE_ENV` is set to `production`, they are not required, as the emails are not sent and are instead generated, saved and previewed locally.

## Development

This project uses TypeScript and uses [amqplib](https://www.npmjs.com/package/amqplib) for consuming messages from the ticket queue. It also uses [email-templates](https://www.npmjs.com/package/email-templates) for sending email and [Handlebars.js](https://www.npmjs.com/package/handlebars) as the templating engine for the emails. Since the project is Docker based, it is not required to install Node.js on the system, but it is **highly recommended** for local development.

### Requirements

- Node.js version `16.14.x` (LTS).
- An available instance or cluster of [RabbitMQ](https://www.rabbitmq.com/).
- A running instance of the [PNR database](https://github.com/idos2002/skyline-crs/tree/master/db/pnr) along with its dependencies.
- A running instance of the [inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) along with its dependencies.

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

In order to run the project locally, make sure to first set all required environment variables for the current shell session, as well as setting `NODE_ENV` to `development` (in order for [email previews to open in the browser](https://github.com/forwardemail/email-templates#preview)).

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
