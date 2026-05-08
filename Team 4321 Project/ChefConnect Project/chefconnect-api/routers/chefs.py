from fastapi import APIRouter, HTTPException

from mock_data import chefs

router = APIRouter(prefix="/chefs", tags=["chefs"])


@router.get("")
def get_all_chefs():
    return chefs


@router.get("/{chef_id}")
def get_chef(chef_id: int):
    chef = next((c for c in chefs if c["id"] == chef_id), None)
    if chef is None:
        raise HTTPException(status_code=404, detail="Chef not found")
    return chef
