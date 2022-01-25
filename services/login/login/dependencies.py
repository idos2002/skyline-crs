import logging

from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore

from .config import get_settings
from .models import PnrValidationDetails
from .schemas import LoginDetails
from .util import log_query

log = logging.getLogger(__name__)

settings = get_settings()
client = AsyncIOMotorClient(settings.pnr_db_url, uuidRepresentation="standard")
db = client[settings.pnr_db_name]
pnrs = db[settings.pnr_db_collection_name]


async def validate_login_details(
    login_details: LoginDetails,
) -> PnrValidationDetails | None:
    query = {"_id": login_details.pnr_id}
    projection = {
        "_id": 1,
        "contact": {"firstName": 1, "surname": 1},
    }
    pnr_dict = await pnrs.find_one(query, projection)

    log_query(
        log,
        "Queried the PNR database successfully",
        query={"type": "findOne", "body": query, "projection": projection},
        response=pnr_dict,
    )

    if pnr_dict is None:
        return None

    pnr = PnrValidationDetails(**pnr_dict)

    if (
        pnr.contact.first_name.casefold() != login_details.first_name.casefold()
        or pnr.contact.surname.casefold() != login_details.surname.casefold()
    ):
        return None

    return pnr
