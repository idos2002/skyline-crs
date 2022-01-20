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
        details = [
            ErrorCause.construct(cause="/".join(str(e["loc"])), message=e["msg"])
            for e in error.errors()
        ]
        return cls.construct(
            error="Validation error",
            message="Request has an invalid format.",
            details=details,
        )


class EndpointException(Exception):
    def __init__(self, details: ErrorDetails):
        self.details = details
        super().__init__(details.message)


class ServiceNotFoundException(EndpointException):
    def __init__(self, details: ErrorDetails | None = None):
        details = details or ErrorDetails(
            error="Flights not found",
            message="The flights for the requested origin and destination airports.",
        )
        super().__init__(details)


class FlightNotFoundException(EndpointException):
    def __init__(self, details: ErrorDetails | None = None):
        details = details or ErrorDetails(
            error="Flight not found",
            message="Could not find flight with the requested flight ID.",
        )
        super().__init__(details)


class ExternalDependencyException(Exception):
    pass
