import os
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

class Config:
    # Use PostgreSQL database as originally configured
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:newpassword@localhost:5432/expense_tracker")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-jwt-tokens")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Token expires in 1 hour
