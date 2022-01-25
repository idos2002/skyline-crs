from uuid import UUID

from pydantic import Field

from .util import CamelCaseModel


class ContactDetails(CamelCaseModel):
    first_name: str
    surname: str


class PnrValidationDetails(CamelCaseModel):
    id: UUID = Field(alias="_id")
    contact: ContactDetails
