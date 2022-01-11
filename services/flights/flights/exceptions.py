from pydantic import BaseModel


class ExceptionDetails(BaseModel):
    error: str
    message: str


class SkylineException(Exception):
    def __init__(self, details: ExceptionDetails):
        self.details = details
        super().__init__(details.message)


class ServiceNotFoundException(SkylineException):
    def __init__(self, details: ExceptionDetails | None = None):
        details = details or ExceptionDetails(
            error="Flights not found",
            message="The flights for the requested origin and destination airports.",
        )
        super().__init__(details)


class FlightNotFoundException(SkylineException):
    def __init__(self, details: ExceptionDetails | None = None):
        details = details or ExceptionDetails(
            error="Flight not found",
            message="Could not find flight with the requested flight ID.",
        )
        super().__init__(details)
