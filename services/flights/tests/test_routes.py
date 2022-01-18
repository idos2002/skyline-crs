import pytest
from fastapi import status
from fastapi.testclient import TestClient

from flights import dependencies
from flights.main import app

from . import expected, overrides

client = TestClient(app)

app.dependency_overrides.update(
    {
        dependencies.get_flights: overrides.get_flights,
        dependencies.get_flight_details: overrides.get_flight_details,
        dependencies.get_flight_seats: overrides.get_flight_seats,
    }
)


@pytest.mark.parametrize(
    "origin, destination, departure_time, expected_status, expected_response",
    [
        (
            expected.flights.origin,
            expected.flights.destination,
            expected.flights.departure_time,
            status.HTTP_200_OK,
            expected.flights.success_response_all_flights,
        ),
        (
            expected.flights.origin,
            expected.flights.no_flights_destination,
            expected.flights.departure_time,
            status.HTTP_404_NOT_FOUND,
            expected.flights.flights_not_found_response,
        ),
    ],
)
def test_find_flights_for_existing_service(
    origin,
    destination,
    departure_time,
    expected_status,
    expected_response,
):
    response = client.get(f"/flights/{origin}/{destination}/{departure_time}")
    assert response.status_code == expected_status
    assert response.json() == expected_response


@pytest.mark.parametrize(
    "flight_id, expected_status, expected_response",
    [
        (
            expected.flight_details.existing_flight_id,
            status.HTTP_200_OK,
            expected.flight_details.success_response,
        ),
        (
            expected.flight_details.nonexistent_flight_id,
            status.HTTP_404_NOT_FOUND,
            expected.flight_details.flight_not_found_response,
        ),
    ],
)
def test_get_flight_details(flight_id, expected_status, expected_response):
    response = client.get(f"/flight/{flight_id}")
    assert response.status_code == expected_status
    assert response.json() == expected_response


@pytest.mark.parametrize(
    "flight_id, expected_status, expected_response",
    [
        (
            expected.flight_seats.existing_flight_id,
            status.HTTP_200_OK,
            expected.flight_seats.success_response,
        ),
        (
            expected.flight_seats.nonexistent_flight_id,
            status.HTTP_404_NOT_FOUND,
            expected.flight_seats.flight_not_found_response,
        ),
    ],
)
def test_get_flight_seats(flight_id, expected_status, expected_response):
    response = client.get(f"/flight/{flight_id}/seats")
    assert response.status_code == expected_status
    assert response.json() == expected_response
