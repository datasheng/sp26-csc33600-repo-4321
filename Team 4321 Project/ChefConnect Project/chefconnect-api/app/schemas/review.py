from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Annotated
from pydantic import Field


class ReviewCreate(BaseModel):
    chef_id: int
    booking_id: int
    rating: Annotated[Decimal, Field(ge=1, le=5)]
    comment: str


class ReviewOut(BaseModel):
    review_id: int
    chef_id: int
    user_id: int
    username: str
    rating: Decimal
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}
