from mysql.connector.pooling import MySQLConnectionPool
from app.core.config import settings

pool = MySQLConnectionPool(
    pool_name="chefconnect",
    pool_size=10,
    host=settings.DB_HOST,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
)


def get_db():
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()
