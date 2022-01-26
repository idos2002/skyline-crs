from uuid import UUID

from pydantic import Field

from .util import CamelCaseModel


class LoginDetails(CamelCaseModel):
    pnr_id: UUID = Field(
        title="PNR ID",
        description="The PNR ID for the requested booking",
        example="17564e2f-7d32-4d4a-9d99-27ccd768fb7d",
    )
    first_name: str = Field(
        title="First name",
        description="First name of the person who made the booking",
        example="John",
    )
    surname: str = Field(
        description="Surname (or last name) of the person who made the booking",
        example="Doe",
    )


class AccessToken(CamelCaseModel):
    token: str = Field(description="The JWT access token")
