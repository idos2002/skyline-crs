from typing import Any

from fastapi import status

from .exceptions import ErrorDetails

app_description = """
The login service is responsible for authenticating the client to access protected
resources in the system, such as booking information.

## Features
- Get a JWT access token to access protected resources, such as booking information.
"""

examples: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "token": (
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxNzU2NGUyZi03ZDMyLTRkNGEtO"
            "WQ5OS0yN2NjZDc2OGZiN2QiLCJpYXQiOjE2NDMxNTcxMzYsImV4cCI6MTY0MzE1ODkzNn0.OW3"
            "osgk2vMK2GKJ-T4GfrcrxVd1n2QzToO1zFboJBp0"
        )
    },
    status.HTTP_400_BAD_REQUEST: {
        "error": "Log in failed",
        "message": (
            "Could not authenticate booking for the given PNR ID with the given "
            "first name and surname."
        ),
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "error": "Validation error",
        "message": "Request has an invalid format.",
        "details": [
            {"cause": "body/firstName", "message": "field required"},
            {"cause": "body/surname", "message": "field required"},
        ],
    },
}

responses: dict[int | str, Any] = {
    status.HTTP_200_OK: {
        "content": {"application/json": {"example": examples[status.HTTP_200_OK]}}
    },
    status.HTTP_400_BAD_REQUEST: {
        "model": ErrorDetails,
        "description": "Log in failed",
        "content": {
            "application/json": {
                "example": examples[status.HTTP_400_BAD_REQUEST],
            }
        },
    },
    status.HTTP_422_UNPROCESSABLE_ENTITY: {
        "model": ErrorDetails,
        "description": "Validation error",
        "content": {
            "application/json": {
                "example": examples[status.HTTP_422_UNPROCESSABLE_ENTITY]
            }
        },
    },
}
