from uuid import UUID

from pydantic import Field

from .util import CamelCaseModel


class LoginDetails(CamelCaseModel):
    pnr_id: UUID = Field(
        title="PNR ID", description="The PNR ID for the requested booking"
    )
    first_name: str = Field(
        title="First name", description="First name of the person who made the booking"
    )
    surname: str = Field(
        description="Surname (or last name) of the person who made the booking"
    )


class AccessToken(CamelCaseModel):
    token: str = Field(description="The JWT access token")
