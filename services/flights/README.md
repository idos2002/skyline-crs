# Flights Service

The flights service provides an external API for the inventory, which contains all the flights' information.

## Features

- Get a list of all available flights for from the origin to the destination.
- Get details about specific flights.
- Get flight seats and seat maps.

## Usage

This is a [Docker](https://www.docker.com/) based [Python](https://www.python.org/) project, therefore it should be run in a container.

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
docker build -t skyline-flights .
```

And to run the image in a new container run:

```
docker run -dp 80:80 -e SKYLINE_INVENTORY_MANAGER_URL=<Inventory manager URL> skyline-flights
```

Note that this service depends on the [inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) to retrieve data. It is still usable to a degree by providing some URL to the `SKYLINE_INVENTORY_MANAGER_URL` environment variable, which will allow access to the `/docs` and `/redoc` endpoints, but all other requests will result in an error from the service.

## API Documentation

The service's API is documented at [the Skyline CRS documentation](https://idos2002.github.io/skyline-crs/services/flights/).

If the service is up and running, there are also two interactive API documentation UIs available for the service:

- [Swagger UI](https://swagger.io/tools/swagger-ui/) - accessible at `/docs`.
- [Redoc](https://github.com/Redocly/redoc) - accessible at `/redoc`.

## Environment Variables

The service is configured using environment variables. Note that some environment variables are required, and the image will not run without them.

### `SKYLINE_INVENTORY_MANAGER_URL` (Required)

Sets the [inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) URL to query the inventory information from.  
Example values:

- `http://localhost:8080/v1/graphql`
- `http://inventory-manager/v1/graphql`

### `SKYLINE_PORT`

Sets the TCP port for the service to listen on for incoming requests.  
**Default:** `80`.

### `SKYLINE_LOG_LEVEL`

Sets the log level for the service. Available values are: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.  
**Default:** `INFO`.

### `SKYLINE_OPENAPI_SERVER_URL`

Sets the server URL for the OpenAPI schema. Used to set the server for Swagger UI to make requests to. May be a relative URL as specified by the [documentation](https://swagger.io/docs/specification/api-host-and-base-path/).  
**Default:** `/`.

### `SKYLINE_OPENAPI_SCHEMA_PREFIX`

Sets a prefix for exposing the OpenAPI schema for Swagger UI.  
**Default:** `/`.

### `SKYLINE_IATA_AIRLINE_CODE`

Sets the Skyline IATA airline's code. Note that it must conform to the [IATA airline designator standard](https://en.wikipedia.org/wiki/Airline_codes#IATA_airline_designator).  
**Regex:** `/^[A-Z0-9]{2,3}$/`  
**Default:** `SK`

### `SKYLINE_ICAO_AIRLINE_CODE`

Sets the Skyline ICAO airline's code. Note that it must conform to the [ICAO airline designator standard](https://en.wikipedia.org/wiki/Airline_codes#ICAO_airline_designator).  
**Regex:** `/^[A-Z]{3}$/`  
**Default:** `SKL`

## Development

This project is based on the Python framework [FastAPI](https://fastapi.tiangolo.com/) and uses the Python package manager [Poetry](https://python-poetry.org/). Since the project is Docker based, it is not required to install Python and Poetry on the system, but it is **highly recommended** for local development.

### Requirements

- Python version `3.10` and up.
- Poetry version `1.1` and up.
- A running instance of [inventory manager](https://github.com/idos2002/skyline-crs/tree/master/services/inventory-manager) along with its dependencies.

### Installation

To create a virtual environment with poetry and install all dependencies, navigate to the project's directory and run:

```
poetry install --no-root
```

This will create a new virtual environment and install all dependencies to it, except the project itself (hence the `--no-root` option).

To activate the virtual environment for the current shell run:

```
poetry shell
```

or use `poetry run` to execute commands inside the virtual environments without activating it. Check the [Poetry documentation](https://python-poetry.org/docs/master/basic-usage/#using-your-virtual-environment) for more information.

### Running Locally

In order to run the project locally, make sure to first set all required environment variables for the current shell session.
The project uses the ASGI server [Uvicorn](https://www.uvicorn.org/) for running the application.

To start the Uvicorn server locally, make sure you are at the projects directory and run:

```
uvicorn flights.main:app --port 80 --log-config logging.yaml --no-access-log
```

This will start the server on `localhost:80` and will set up the logging for the application using the `logging.yaml` file.

### Tools

The project uses multiple tools to assure code quality and correctness. Most of the tools are configured in the project's `pyproject.toml` file, except those who do not support this kind of configuration yet, and have their own configuration files, e.g. Flake8 with the configuration file `.flake8`. It is required to use these tools to ensure code quality before any commit!

- [Black](https://black.readthedocs.io/en/stable/) - An opinionated Python code formatter, used to keep the code formatting consistent.  
  Example Usage: `black .`
- [isort](https://pycqa.github.io/isort/) - Sorts, organizes and formats import statements in the project.  
  Example usage: `isort .`
- [Flake8](https://flake8.pycqa.org/en/latest/) - A Python style guide enforcer and linter which wraps around the tools: [PyFlakes](https://pypi.org/project/pyflakes/), [pycodestyle](https://pypi.org/project/pycodestyle/) and [Ned Batchelder's McCabe complexity checker](https://github.com/PyCQA/mccabe).  
  Example usage: `flake8`
- [MyPy](https://mypy.readthedocs.io/en/stable/) - A static type checker for Python which uses Python's type hints for type checking.  
  Example usage: `mypy .`
- [PyTest](https://docs.pytest.org/en/6.2.x/) - The testing framework used for the project.  
  Example usage: `pytest`
- [Coverage.py](https://coverage.readthedocs.io/en/6.2/) - Coverage.py is a tool for measuring code coverage of Python programs. It is used together with PyTest to measure the tests' code coverage.  
  Example usage: `coverage run -m pytest && coverage report`
