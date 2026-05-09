from pydantic import BaseModel
from typing import Optional


class IngredientOut(BaseModel):
    ingredient_id: int
    ingredient_name: str
    amount_required: Optional[str] = None

    model_config = {"from_attributes": True}


class DishOut(BaseModel):
    dish_id: int
    name: str
    cuisine_type: Optional[str]
    description: Optional[str]
    ingredients: list[IngredientOut] = []

    model_config = {"from_attributes": True}
