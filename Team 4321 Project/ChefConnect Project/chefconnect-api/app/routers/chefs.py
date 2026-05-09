from fastapi import APIRouter, Depends, Query
from mysql.connector.connection import MySQLConnection
from typing import Optional
from app.database import get_db
from app.core.dependencies import require_chef
from app.schemas.chef import ChefListItem, ChefPublic, ChefProfileUpdate
from app.schemas.chef_availability import AvailabilityCreate, AvailabilityOut
from app.schemas.review import ReviewOut
from app.services import chef_service

router = APIRouter(prefix="/chefs", tags=["chefs"])


@router.get("", response_model=list[ChefListItem])
def browse_chefs(
    cuisine_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    conn: MySQLConnection = Depends(get_db),
):
    return chef_service.get_chefs(conn, cuisine_type, search)


@router.get("/{chef_id}", response_model=ChefPublic)
def chef_profile(chef_id: int, conn: MySQLConnection = Depends(get_db)):
    return chef_service.get_chef_by_id(conn, chef_id)


@router.patch("/{chef_id}", response_model=ChefPublic)
def update_profile(
    chef_id: int,
    body: ChefProfileUpdate,
    current_user: dict = Depends(require_chef),
    conn: MySQLConnection = Depends(get_db),
):
    return chef_service.update_chef_profile(conn, chef_id, current_user, body.model_dump())


@router.get("/{chef_id}/availability", response_model=list[AvailabilityOut])
def chef_availability(chef_id: int, conn: MySQLConnection = Depends(get_db)):
    return chef_service.get_chef_availability(conn, chef_id)


@router.post("/{chef_id}/availability", response_model=AvailabilityOut, status_code=201)
def add_availability(
    chef_id: int,
    body: AvailabilityCreate,
    current_user: dict = Depends(require_chef),
    conn: MySQLConnection = Depends(get_db),
):
    return chef_service.add_availability(conn, chef_id, current_user, body.start_time, body.end_time)


@router.delete("/{chef_id}/availability/{avail_id}", status_code=204)
def remove_availability(
    chef_id: int,
    avail_id: int,
    current_user: dict = Depends(require_chef),
    conn: MySQLConnection = Depends(get_db),
):
    chef_service.delete_availability(conn, chef_id, avail_id, current_user)


@router.get("/{chef_id}/reviews", response_model=list[ReviewOut])
def chef_reviews(chef_id: int, conn: MySQLConnection = Depends(get_db)):
    return chef_service.get_chef_reviews(conn, chef_id)
