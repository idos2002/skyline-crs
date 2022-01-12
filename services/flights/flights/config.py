from enum import Enum

from pydantic import AnyHttpUrl, BaseSettings, Field


class LogLevel(str, Enum):
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class Settings(BaseSettings):
    port: int = 80
    log_level: LogLevel = LogLevel.INFO
    inventory_manager_url: AnyHttpUrl
    iata_airline_code: str = Field("SK", regex=r"^[A-Z0-9]{2,3}$")
    icao_airline_code: str = Field("SKL", regex=r"^[A-Z]{3}$")

    class Config:
        env_prefix = "skyline_"
