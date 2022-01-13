from datetime import datetime, timedelta
from functools import cache
from typing import Any
from uuid import UUID

from fastapi import Path, Query
from httpx import AsyncClient, Response

from .config import Settings
from .models import FlightDetails, FlightSeats, ServiceFlights
from .util import CabinClass


@cache
def get_settings() -> Settings:
    return Settings()


async def query_inventory_manager(
    query: str,
    variables: dict[str, Any],
) -> dict[str, Any]:
    settings = get_settings()
    async with AsyncClient() as client:
        response: Response = await client.post(
            settings.inventory_manager_url,
            json={"query": query, "variables": variables},
        )
        return response.json()


async def get_flights(
    origin: str = Path(..., regex=r"^[a-zA-Z]{3}$"),
    destination: str = Path(..., regex=r"^[a-zA-Z]{3}$"),
    departure_time: datetime = Path(...),
    passengers: int = Query(1, ge=1),
    cabin_classes: set[CabinClass] | None = Query(None, alias="cabin"),
) -> ServiceFlights | None:
    query = """
        query findFlights(
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
    variables = {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "from_time": departure_time.isoformat(),
        "to_time": (departure_time + timedelta(days=1)).isoformat(),
        "passengers": passengers,
    }
    if cabin_classes:
        variables["cabin_classes"] = cabin_classes
    response = await query_inventory_manager(query, variables)
    services = response["data"]["service"]
    if not services:
        return None
    # There should be only one airline service with this combination
    # of origin and destination airports
    flights_data = services[0]
    return ServiceFlights(**flights_data)


async def get_flight_details(flight_id: UUID) -> FlightDetails | None:
    query = """
        query getFlight($flight_id: uuid!) {
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
    variables = {"flight_id": str(flight_id)}
    response = await query_inventory_manager(query, variables)
    flight_data = response["data"]["flight_by_pk"]
    if not flight_data:
        return None
    return FlightDetails(**flight_data)


async def get_flight_seats(flight_id: UUID) -> FlightSeats | None:
    query = """
        query getFlightSeats($flight_id: uuid!) {
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
    variables = {"flight_id": str(flight_id)}
    response = await query_inventory_manager(query, variables)
    flight_seats_data = response["data"]["flight_by_pk"]
    if not flight_seats_data:
        return None
    return FlightSeats(**flight_seats_data)
