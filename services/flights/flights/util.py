from datetime import datetime
from enum import Enum
from logging import Logger

from fastapi import Request, Response


class CabinClass(str, Enum):
    ECONOMY = "E"
    BUSINESS = "B"
    FIRST = "F"


def log_access(
    logger: Logger,
    request: Request,
    response: Response,
    start_time: datetime,
    end_time: datetime,
    duration_ns: int,
    *,
    time_format="%Y-%m-%dT%H:%M:%S.%fZ",
):
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

    logger.info(
        "%(host)s - %(method)s %(path)s - %(responseCode)s (%(duration)sms)",
        params,
        extra={"extra": params | extra},
    )
