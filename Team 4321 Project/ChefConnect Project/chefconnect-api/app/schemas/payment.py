from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class PaymentOut(BaseModel):
    payment_id: int
    booking_id: int
    total_amount: Decimal
    platform_commission: Decimal
    booking_fee: Decimal
    payment_status: str
    payment_date: Optional[datetime] = None
    payment_method: Optional[str] = None

    model_config = {"from_attributes": True}
