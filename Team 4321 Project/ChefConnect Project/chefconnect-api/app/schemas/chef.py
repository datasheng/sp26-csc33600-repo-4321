from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class ChefListItem(BaseModel):
    chef_id: int
    username: str
    bio: Optional[str]
    specialty_cuisine: Optional[str]
    rating_avg: Optional[Decimal]
    hourly_rate: Optional[Decimal]
    booking_count: int = 0

    model_config = {"from_attributes": True}


class ChefPublic(ChefListItem):
    user_id: int


class ChefProfileUpdate(BaseModel):
    bio: Optional[str] = None
    specialty_cuisine: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
