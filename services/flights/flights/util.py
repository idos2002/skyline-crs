import logging
from datetime import datetime
from enum import Enum

from fastapi import Request, Response


class CabinClass(str, Enum):
    ECONOMY = "E"
    BUSINESS = "B"
    FIRST = "F"


def log_access(
    logger: logging.Logger,
    request: Request,
    response: Response,
    start_time: datetime,
    end_time: datetime,
    duration_ns: int,
    *,
    level: int = logging.INFO,
    time_format: str = "%Y-%m-%dT%H:%M:%S.%fZ",
):
    """
    Logs HTTP access details (request and response details).

    :param logger: The logger instance to be used for logging.
    :param request: The request to log.
    :param response: The corresponding response to the request to log.
    :param start_time: The time the request was received.
    :param end_time: The time the response was received.
    :param duration_ns: The time duration it took to process the request and get a
        response, in nanoseconds.
    :param level: The logging level to log this message. Defaults to INFO.
    :param time_format: Format for start_time and end_time in parameters using
        datetime.datetime.strftime formatting.
    """
    duration_ms = duration_ns // 1_000_000

    path = request.url.path
    if query := request.url.query:
        path += f"?{query}"

    params = {
        "host": request.client.host,
        "method": request.method,
        "path": path,
        "duration": duration_ms,
        "responseCode": response.status_code,
    }
    extra = {
        "type": "access",
        "startTime": start_time.strftime(time_format),
        "endTime": end_time.strftime(time_format),
        "port": request.client.port,
        "httpVersion": request.scope.get("http_version", None),
    }

    logger.log(
        level,
        "%(host)s - %(method)s %(path)s - %(responseCode)s (%(duration)sms)",
        params,
        extra={"extra": params | extra},
    )
