from __future__ import annotations

from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field


class ErrorCause(BaseModel):
    cause: str = Field(description="The part of the request that caused the error")
    message: str = Field(description="Explanation about the error")


class ErrorDetails(BaseModel):
    error: str = Field(description="Error summary")
    message: str = Field(description="The error's message")
    details: list[ErrorCause] | None = Field(None, description="Error details")

    @classmethod
    def from_request_validation_error(
        cls, error: RequestValidationError
    ) -> ErrorDetails:
        details: list[ErrorCause] = []
        for e in error.errors():
            cause = "/".join([str(loc) for loc in e["loc"]])
            details.append(ErrorCause(cause=cause, message=e["msg"]))

        return cls.construct(
            error="Validation error",
            message="Request has an invalid format.",
            details=details,
        )


class AuthenticationException(Exception):
    def __init__(self, details: ErrorDetails | None = None):
        self.details = details or ErrorDetails(
            error="Log in failed",
            message=(
                "Could not authenticate booking for the given PNR ID with the given "
                "first name and surname."
            ),
        )
        super().__init__(self.details.message)


class ExternalDependencyException(Exception):
    pass
