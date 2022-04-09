# Skyline CRS

![License badge](https://badgen.net/github/license/idos2002/skyline-crs)
![Latest stable release](https://badgen.net/github/release/idos2002/skyline-crs/stable)

**Skyline CRS** is a scalable computer reservation system (CRS) for a fictional airline called Skyline, built for the cloud. The project is deployed using [Docker](https://www.docker.com/) containers and also provides a basic [Kubernetes](https://kubernetes.io/) configuration.

The system exposes a public REST API and uses JWT token based authentication, hence allowing integration with other travel agencies.
There is also a web application for the airline, from which the clients may make all actions.

## Documentation

You can find the all of the services' documentation here: [Skyline CRS Documentation](https://idos2002.github.io/skyline-crs/).

## Usage

This is a monorepo for the entirety of the Skyline CRS project. Since this project centers around containerization, it is recommended to use [Docker Compose](https://docs.docker.com/compose/) for running the project with the provided `docker-compose.yml` file.

Before continuing, clone this repository by running:

```
git clone https://github.com/idos2002/skyline-crs.git
```

### Using Docker Compose

To run this project using Docker Compose, first make sure that Docker and Docker Compose are installed on the system.

Then, create a file named `email.env.local` containing the email service provider details and account credentials for sending emails.

Example file contents using a [Zoho Mail](https://www.zoho.com/mail/) account:

```sh
SKYLINE_EMAIL_ADDRESS=example@zohomail.com
SKYLINE_SMTP_HOST=smtp.zoho.com
SKYLINE_SMTP_PORT=465
SKYLINE_SMTP_USERNAME=example@zohomail.com
SKYLINE_SMTP_PASSWORD=password
```

Check the [the email service's README file](https://github.com/idos2002/skyline-crs/tree/master/services/email#readme) for more information about the required environment variables.

Finally, to start the project locally, run in the root project directory:

```
docker-compose up -d --build
```

### Using Docker

Since the project is containerized, you may choose to build the Docker images of the services individually, or pull them from Docker Hub where they are hosted under the namespace [idos2002](https://hub.docker.com/u/idos2002). All hosted images relating to this project start with the prefix `skyline-`.

For using the images, consult their respective `README` file. Note that most of the services depend on other services to be running, so make sure to have the needed containers running as well.

## Development

For information regarding local development of Skyline CRS services, check the services' `README` files.
