from fastapi import HTTPException, status
from mysql.connector.connection import MySQLConnection


def _attach_ingredients(conn: MySQLConnection, dishes: list) -> list:
    if not dishes:
        return dishes

    dish_ids = [d["dish_id"] for d in dishes]
    placeholders = ", ".join(["%s"] * len(dish_ids))

    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        f"""
        SELECT di.dish_id, i.ingredient_id, i.ingredient_name, di.amount_required
        FROM DishIngredient di
        JOIN Ingredient i ON di.ingredient_id = i.ingredient_id
        WHERE di.dish_id IN ({placeholders})
        """,
        dish_ids,
    )
    rows = cursor.fetchall()
    cursor.close()

    ingredients_map: dict[int, list] = {d["dish_id"]: [] for d in dishes}
    for row in rows:
        ingredients_map[row["dish_id"]].append(row)

    for dish in dishes:
        dish["ingredients"] = ingredients_map[dish["dish_id"]]

    return dishes


def get_dishes(conn: MySQLConnection) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT dish_id, name, cuisine_type, description FROM Dish ORDER BY name")
    dishes = cursor.fetchall()
    cursor.close()
    return _attach_ingredients(conn, dishes)


def get_dish_by_id(conn: MySQLConnection, dish_id: int) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT dish_id, name, cuisine_type, description FROM Dish WHERE dish_id = %s", (dish_id,)
    )
    dish = cursor.fetchone()
    cursor.close()

    if not dish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dish not found")

    return _attach_ingredients(conn, [dish])[0]
