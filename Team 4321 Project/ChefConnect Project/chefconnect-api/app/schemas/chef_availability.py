from pydantic import BaseModel, model_validator
from datetime import datetime


class AvailabilityCreate(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def end_after_start(self) -> "AvailabilityCreate":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AvailabilityOut(BaseModel):
    availability_id: int
    chef_id: int
    start_time: datetime
    end_time: datetime

    model_config = {"from_attributes": True}
