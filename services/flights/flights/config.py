import json
import logging
import time
from enum import Enum
from functools import cache
from typing import Any

from pydantic import AnyHttpUrl, BaseModel, BaseSettings, Field


class LogLevel(str, Enum):
    """
    Log level for the flights logger.
    """

    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class Settings(BaseSettings):
    """
    Provides application setting for the entire application, which are configurable
    through environment variables.

    This class should not be instantiated explicitly in most cases,
    the :func:`get_settings` function should be used instead, as it caches the instance
    upon first call (as each instantiation involves reading environment variables).
    """

    log_level: LogLevel | None = None
    inventory_manager_url: AnyHttpUrl
    iata_airline_code: str = Field("SK", regex=r"^[A-Z0-9]{2,3}$")
    icao_airline_code: str = Field("SKL", regex=r"^[A-Z]{3}$")

    class Config:
        env_prefix = "skyline_"


@cache
def get_settings() -> Settings:
    """
    Creates a new instance of :class:`Settings` and caches it on first call.
    On subsequent calls the cached instance is returned.

    :return: The cached settings instance.
    """
    return Settings()


class ConfigurationException(Exception):
    """
    Raised when flights service has a configuration error.
    """

    pass


class JsonLogFormatter(logging.Formatter):
    """
    Structured JSON :class:`logging.Formatter` for the python :mod:`logging` module.

    The JSON logs have the following schema:
    ::
        {
            "time": "<ISO 8601 UTC timestamp, e.g. 2022-01-15T20:36:10.412635Z>",
            "level": "DEBUG | INFO | WARNING | ERROR | CRITICAL",
            "logger": "<Name of the logger>",
            "message": "<Some message>",
            "extra": { <Optional data> }
        }
    The JSON log fields can be customized with the constructor's ``fields`` parameter.
    The ``extra`` field is always included if extra parameters are provided.

    For example:
    ::
        extras = { "type": "access", "method": "GET", ... }
        logger.info("Some message", extra={"extra": extras})
    Will log:
    ::
        {
            "time": "...",
            "level": "INFO",
            "logger": "...",
            "message": "Some message",
            "extra": {
                "type": "access",
                "method": "GET",
                ...
            }
        }

    It should be noted that each log is printed on a single line.
    """

    fields_mapping = {
        "time": "asctime",
        "level": "levelname",
        "logger": "name",
        "message": "message",
    }
    default_fields = fields_mapping.keys()

    converter = time.gmtime

    def __init__(
        self,
        fields: list[str] | None = None,
        time_format: str = "%Y-%m-%dT%H:%M:%S",
        msec_format: str = "%s.%03dZ",
        validate: bool = True,
    ):
        """
        Initializes the formatter.

        :param fields: The fields to include in the log.
            Available fields: time, level, logger, message.
            Defaults to all available fields.
        :param time_format: Sets the default_time_format attribute of parent class.
            Defaults to "%Y-%m-%dT%H:%M:%S".
        :param msec_format: Sets the default_msec_format attribute of parent class.
            Defaults to "%s.%03dZ".
        :param validate: If the fields list should be validated for containing
            supported fields.
            Defaults to True.

        :raises ConfigurationException: Raised when validation is enabled and the given
            fields list is invalid.
        """
        super().__init__()

        if validate:
            self._validate_fields(fields)

        self._fields = fields if fields else self.default_fields

        self.default_time_format = time_format
        self.default_msec_format = msec_format

    def _validate_fields(self, fields: list[str] | None):
        if not fields:
            return
        for field in fields:
            if field not in self.fields_mapping.keys():
                raise ConfigurationException(f"{field} is not a valid log field name")

    def usesTime(self) -> bool:
        """
        Checks if "time" should be used in the log (if is included in the fields list).
        """
        return "time" in self._fields

    @staticmethod
    def _json_dumps_fallback(o: Any) -> Any:
        match o:
            case BaseModel():
                return o.dict()
            case _:
                return str(o)

    def format(self, record: logging.LogRecord) -> str:
        """
        Formats the :class:`logging.LogRecord` to a structured JSON log.
        """
        record.message = record.getMessage()

        if self.usesTime():
            record.asctime = self.formatTime(record)

        if record.exc_info:
            # Cache the traceback text to avoid converting it multiple times
            # (it's constant anyway)
            if not record.exc_text:
                record.exc_text = self.formatException(record.exc_info)

        message_dict: dict[str, Any] = {}
        for field, attribute in self.fields_mapping.items():
            if field in self._fields:
                message_dict[field] = getattr(record, attribute)

        if extra := record.__dict__.get("extra"):
            message_dict["extra"] = extra

        if record.exc_text:
            if message_dict.get("extra") is None:
                message_dict["extra"] = {}

            message_dict["extra"] |= {
                "type": "exception",
                "details": record.exc_text,
            }

        if record.stack_info:
            message_dict["extra"]["stackFrame"] = self.formatStack(record.stack_info)

        return json.dumps(message_dict, default=JsonLogFormatter._json_dumps_fallback)


def config_logging():
    """
    Configures logging for the application. Should be called before instantiating
    the application object.

    Must be used with Uvicorn's ``--config-file command`` line option to use
    ``flights/logging.yaml`` for the application's logging configuration.

    This function overrides the ``flights`` logger's default log level if another
    log level was provided using environment variables.
    """
    log_level = get_settings().log_level
    if log_level:
        logging.getLogger("flights").setLevel(log_level.value)
