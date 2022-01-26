import os
from datetime import datetime, timedelta
from uuid import UUID

import jwt
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from login.dependencies import validate_login_details
from login.main import app
from login.models import ContactDetails, PnrValidationDetails
from login.schemas import LoginDetails

client = TestClient(app)

pnr_mock = PnrValidationDetails(
    id=UUID("17564e2f-7d32-4d4a-9d99-27ccd768fb7d"),
    contact=ContactDetails(first_name="John", surname="Doe"),
)

# Set in pytest's pyproject.toml environment variables
access_token_secret = os.getenv("SKYLINE_ACCESS_TOKEN_SECRET")


async def validate_login_details_override(
    login_details: LoginDetails,
) -> PnrValidationDetails | None:
    if (
        login_details.pnr_id == pnr_mock.id
        and login_details.first_name == pnr_mock.contact.first_name
        and login_details.surname == pnr_mock.contact.surname
    ):
        return pnr_mock
    return None


app.dependency_overrides[validate_login_details] = validate_login_details_override


@pytest.mark.filterwarnings("error")
def test_successful_login():
    response = client.post(
        "/login",
        json={
            "pnrId": str(pnr_mock.id),
            "firstName": pnr_mock.contact.first_name,
            "surname": pnr_mock.contact.surname,
        },
    )

    token = jwt.decode(
        response.json()["token"],
        access_token_secret,
        algorithms=["HS256"],
    )
    pnr_id = UUID(token["sub"])
    issued_at = datetime.fromtimestamp(token["iat"])
    expiration = datetime.fromtimestamp(token["exp"])

    assert response.status_code == status.HTTP_200_OK
    assert pnr_id == pnr_mock.id
    assert expiration == issued_at + timedelta(minutes=30)


@pytest.mark.parametrize(
    "pnr_id, first_name, surname",
    [
        (
            "37f6d1e2-4122-493a-9756-860e1682091f",
            pnr_mock.contact.first_name,
            pnr_mock.contact.surname,
        ),
        (str(pnr_mock.id), "Jane", pnr_mock.contact.surname),
        (str(pnr_mock.id), pnr_mock.contact.first_name, "Douglas"),
    ],
)
def test_incorrect_login(pnr_id, first_name, surname):
    response = client.post(
        "/login",
        json={
            "pnrId": pnr_id,
            "firstName": first_name,
            "surname": surname,
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "error": "Log in failed",
        "message": (
            "Could not authenticate booking for the given PNR ID with the given "
            "first name and surname."
        ),
    }


@pytest.mark.parametrize(
    "request_body, expected_response",
    [
        (
            {
                "firstName": pnr_mock.contact.first_name,
                "surname": pnr_mock.contact.surname,
            },
            {
                "error": "Validation error",
                "message": "Request has an invalid format.",
                "details": [{"cause": "body/pnrId", "message": "field required"}],
            },
        ),
        (
            {"pnrId": str(pnr_mock.id), "surname": pnr_mock.contact.surname},
            {
                "error": "Validation error",
                "message": "Request has an invalid format.",
                "details": [{"cause": "body/firstName", "message": "field required"}],
            },
        ),
        (
            {"pnrId": str(pnr_mock.id)},
            {
                "error": "Validation error",
                "message": "Request has an invalid format.",
                "details": [
                    {"cause": "body/firstName", "message": "field required"},
                    {"cause": "body/surname", "message": "field required"},
                ],
            },
        ),
    ],
)
def test_invalid_login(request_body, expected_response):
    response = client.post("/login", json=request_body)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert response.json() == expected_response
