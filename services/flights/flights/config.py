import json
import logging
import time
from enum import Enum
from functools import cache
from typing import Any

from pydantic import AnyHttpUrl, BaseModel, BaseSettings, Field


class LogLevel(str, Enum):
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class Settings(BaseSettings):
    log_level: LogLevel | None = None
    inventory_manager_url: AnyHttpUrl
    iata_airline_code: str = Field("SK", regex=r"^[A-Z0-9]{2,3}$")
    icao_airline_code: str = Field("SKL", regex=r"^[A-Z]{3}$")

    class Config:
        env_prefix = "skyline_"


@cache
def get_settings() -> Settings:
    return Settings()


class ConfigurationException(Exception):
    pass


def json_dumps_fallback(o: Any) -> Any:
    match o:
        case BaseModel():
            return o.dict()
        case _:
            return str(o)


class JsonLogFormatter(logging.Formatter):
    """
    Custom JSON logging Formatter that outputs.
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
        Overwritten to look for the attribute in the fields list instead of the fmt string.
        """
        return "time" in self._fields

    def format(self, record: logging.LogRecord) -> str:
        """
        Mostly the same as the parent's class method, the difference being that a dict is manipulated and dumped as JSON
        instead of a string.
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

        return json.dumps(message_dict, default=json_dumps_fallback)


def config_logging():
    """
    Configures logging for the application. Should be called before instantiating
    the application object.

    Must be used with Uvicorn's `--config-file command` line option to use
    `flights/logging.yaml` for the application's logging configuration.
    This function overrides the flights logger's default log level if another
    log level was provided using environment variables.
    """
    log_level = get_settings().log_level
    if log_level:
        logging.getLogger("flights").setLevel(log_level.value)
