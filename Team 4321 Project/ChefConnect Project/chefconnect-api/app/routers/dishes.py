from fastapi import APIRouter, Depends
from mysql.connector.connection import MySQLConnection
from app.database import get_db
from app.schemas.dish import DishOut
from app.services import dish_service

router = APIRouter(prefix="/dishes", tags=["dishes"])


@router.get("", response_model=list[DishOut])
def list_dishes(conn: MySQLConnection = Depends(get_db)):
    return dish_service.get_dishes(conn)


@router.get("/{dish_id}", response_model=DishOut)
def get_dish(dish_id: int, conn: MySQLConnection = Depends(get_db)):
    return dish_service.get_dish_by_id(conn, dish_id)
