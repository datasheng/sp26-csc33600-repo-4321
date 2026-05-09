from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional, Literal
from app.schemas.payment import PaymentOut


class BookingCreate(BaseModel):
    chef_id: int
    booking_datetime: datetime
    location_address: str
    custom_request: Optional[str] = None
    dish_ids: Optional[list[int]] = []
    hours: int = Field(ge=1, le=12)
    service_type: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: Literal["confirmed", "completed", "cancelled"]


class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    chef_id: int
    chef_name: Optional[str] = None
    booking_datetime: datetime
    location_address: str
    status: str
    custom_request: Optional[str] = None
    payment: Optional[PaymentOut] = None

    model_config = {"from_attributes": True}


class BookingCreateOut(BaseModel):
    booking_id: int
    user_id: int
    chef_id: int
    chef_name: str
    booking_datetime: datetime
    location_address: str
    status: str
    custom_request: Optional[str] = None
    hours: int
    hourly_rate: Decimal
    subtotal: Decimal
    platform_commission: Decimal
    booking_fee: Decimal
    total_amount: Decimal
    payment_id: int
    payment_status: str
