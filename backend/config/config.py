import os
from datetime import timedelta
from urllib.parse import quote_plus

from dotenv import load_dotenv

# -------------------------------------------------
# Base Directory
# -------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# -------------------------------------------------
# Load .env
# -------------------------------------------------

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)

# -------------------------------------------------
# Database Configuration
# -------------------------------------------------

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", ""))
DB_NAME = os.getenv("DB_NAME", "campus_ai")

# -------------------------------------------------
# Validate Required Environment Variables
# -------------------------------------------------

required_env = [
    "SECRET_KEY",
    "JWT_SECRET_KEY",
]

missing = [key for key in required_env if not os.getenv(key)]

if missing:
    raise RuntimeError(
        f"Missing environment variables: {', '.join(missing)}"
    )

# -------------------------------------------------
# Config Class
# -------------------------------------------------

class Config:

    # ----------------------------
    # Flask
    # ----------------------------

    SECRET_KEY = os.getenv("SECRET_KEY")

    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    ENV = os.getenv("FLASK_ENV", "development")

    # ----------------------------
    # JWT
    # ----------------------------

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    JWT_TOKEN_LOCATION = ["headers"]

    JWT_HEADER_NAME = "Authorization"

    JWT_HEADER_TYPE = "Bearer"

    # ----------------------------
    # Database
    # ----------------------------

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://"
        f"{DB_USER}:"
        f"{DB_PASSWORD}@"
        f"{DB_HOST}:"
        f"{DB_PORT}/"
        f"{DB_NAME}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }

    # ----------------------------
    # Uploads
    # ----------------------------

    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "uploads"
    )

    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        "png",
        "jpg",
        "jpeg",
        "gif",
        "pdf",
    }

    # ----------------------------
    # JSON
    # ----------------------------

    JSON_SORT_KEYS = False

    JSONIFY_PRETTYPRINT_REGULAR = False