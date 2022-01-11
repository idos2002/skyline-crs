from enum import Enum


class CabinClass(str, Enum):
    ECONOMY = "E"
    BUSINESS = "B"
    FIRST = "F"
