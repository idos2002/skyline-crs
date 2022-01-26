import logging
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import httpx
from fastapi import Path, Query

from .config import get_settings
from .exceptions import ExternalDependencyException
from .models import FlightDetails, FlightSeats, ServiceFlights
from .util import CabinClass, log_response

log = logging.getLogger(__name__)


async def query_inventory_manager(
    query: str,
    variables: dict[str, Any],
) -> dict[str, Any]:
    """
    Sends a GraphQL query (or mutation) to the inventory manager.

    :param query: The GraphQL query or mutation string.
    :param variables: Variables for the request.
    :return: The JSON response.
    """
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        request_body = {"query": query, "variables": variables}
        try:
            response: httpx.Response = await client.post(
                settings.inventory_manager_url,
                json=request_body,
            )
        except httpx.RequestError as exc:
            log.exception(
                "Error connecting to inventory manager at %s", exc.request.url
            )
            raise ExternalDependencyException

        body: dict[str, Any] = response.json()

        if "errors" in body:
            log_response(
                log,
                "Error with inventory manager GraphQL query: %s",
                ", ".join([e.get("message") for e in body["errors"]]),
                request_body=request_body,
                response=response,
                level=logging.ERROR,
            )
            raise ExternalDependencyException

        log_response(
            log,
            "Queried inventory manager successfully",
            request_body=request_body,
            response=response,
        )

        return body


_get_flights_query = """query findFlights(
  $origin: String!
  $destination: String!
  $from_time: timestamptz!
  $to_time: timestamptz!
  $passengers: bigint! = 1
  $cabin_classes: [String!]! = ["E", "B", "F"]
) {
  service(
    where: {
      origin_airport: { iata_code: { _eq: $origin } }
      destination_airport: { iata_code: { _eq: $destination } }
    }
  ) {
    id
    origin_airport {
      ...airportFragment
    }
    destination_airport {
      ...airportFragment
    }
    flights(
      where: {
        departure_time: { _gte: $from_time, _lte: $to_time }
        available_seats_counts: { available_seats_count: { _gte: $passengers } }
      }
    ) {
      id
      departure_terminal
      departure_time
      arrival_terminal
      arrival_time
      aircraft_model {
        icao_code
        iata_code
        name
      }
      available_seats_counts(
        where: {
          cabin_class: { _in: $cabin_classes }
          available_seats_count: { _gte: $passengers }
        }
      ) {
        cabin_class
        total_seats_count
        available_seats_count
      }
    }
  }
}

fragment airportFragment on airport {
  iata_code
  icao_code
  name
  subdivision_code
  city
  geo_location
}
"""


async def get_flights(
    origin: str = Path(
        ...,
        regex=r"^[a-zA-Z]{3}$",
        description="The IATA airport code of the airport to depart from.",
    ),
    destination: str = Path(
        ...,
        regex=r"^[a-zA-Z]{3}$",
        description="The IATA airport code of the destination airport.",
    ),
    departure_time: datetime = Path(
        ...,
        alias="departureTime",
        description=(
            "The departure time to find flights for. All flights from the given "
            "departure time to 24 hours after will be included.  \n"
            "For example: Searching for a flight with a departure time of "
            "2021-01-01T06:00:00Z will result in a list of all flights from "
            "2021-01-01T06:00:00Z to 2021-01-02T06:00:00Z."
        ),
    ),
    passengers: int = Query(
        1,
        ge=1,
        description="The number of passengers to find a flight for.",
    ),
    cabin_classes: list[CabinClass]
    | None = Query(
        None,
        alias="cabin",
        description="The cabin classes of the flight.",
    ),
) -> ServiceFlights | None:
    variables = {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "from_time": departure_time.isoformat(),
        "to_time": (departure_time + timedelta(days=1)).isoformat(),
        "passengers": passengers,
    }
    if cabin_classes:
        cabin_classes = list(set(cabin_classes))
        variables["cabin_classes"] = cabin_classes
    response = await query_inventory_manager(_get_flights_query, variables)
    services = response["data"]["service"]
    if not services:
        return None
    # There should be only one airline service with this combination
    # of origin and destination airports
    flights_data = services[0]
    return ServiceFlights(**flights_data)


_get_flight_query = """query getFlight($flight_id: uuid!) {
  flight_by_pk(id: $flight_id) {
    id
    service {
      id
      origin_airport {
        ...airportFragment
      }
      destination_airport {
        ...airportFragment
      }
    }
    departure_terminal
    departure_time
    arrival_terminal
    arrival_time
    aircraft_model {
      iata_code
      icao_code
      name
    }
    available_seats_counts {
      cabin_class
      total_seats_count
      available_seats_count
    }
  }
}

fragment airportFragment on airport {
  iata_code
  icao_code
  name
  subdivision_code
  city
  geo_location
}
"""


async def get_flight_details(
    flight_id: UUID = Path(
        ...,
        alias="flightId",
        description="The flight ID of the requested flight.",
    )
) -> FlightDetails | None:
    variables = {"flight_id": str(flight_id)}
    response = await query_inventory_manager(_get_flight_query, variables)
    flight_data = response["data"]["flight_by_pk"]
    if not flight_data:
        return None
    return FlightDetails(**flight_data)


_get_flight_seats_query = """query getFlightSeats($flight_id: uuid!) {
  flight_by_pk(id: $flight_id) {
    id
    aircraft_model {
      icao_code
      iata_code
      name
      seat_maps {
        cabin_class
        start_row
        end_row
        column_layout
      }
    }
    booked_seats {
      seat_row
      seat_column
    }
  }
}
"""


async def get_flight_seats(
    flight_id: UUID = Path(
        ...,
        alias="flightId",
        description="The flight ID of the requested flight.",
    )
) -> FlightSeats | None:
    variables = {"flight_id": str(flight_id)}
    response = await query_inventory_manager(_get_flight_seats_query, variables)
    flight_seats_data = response["data"]["flight_by_pk"]
    if not flight_seats_data:
        return None
    return FlightSeats(**flight_seats_data)
