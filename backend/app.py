from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import logging
import os

from config.config import Config
from database.db import db

from routes.auth_routes import auth_bp
from routes.complaint_routes import complaint_bp
from routes.ai_routes import ai_bp
from routes.notification_routes import notification_bp
from routes.activity_log_routes import activity_bp
from routes.analytics_routes import analytics_bp
from routes.upload_routes import upload_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.staff_routes import staff_bp
from routes.profile_routes import profile_bp


# ==========================================================
# Logging
# ==========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

app = Flask(__name__)
app.config.from_object(Config)


# ==========================================================
# Validate Configuration
# ==========================================================

required_configs = [
    "SQLALCHEMY_DATABASE_URI",
    "JWT_SECRET_KEY",
    "UPLOAD_FOLDER",
]

for key in required_configs:
    if not app.config.get(key):
        raise RuntimeError(f"Missing configuration: {key}")


# ==========================================================
# Upload Folder
# ==========================================================

os.makedirs(
    app.config["UPLOAD_FOLDER"],
    exist_ok=True,
)


# ==========================================================
# Initialize Extensions
# ==========================================================

db.init_app(app)

jwt = JWTManager(app)


# ==========================================================
# CORS
# ==========================================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization",
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],
)


# ==========================================================
# Register Blueprints
# ==========================================================

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth",
)

app.register_blueprint(
    complaint_bp,
    url_prefix="/api/complaints",
)

app.register_blueprint(
    ai_bp,
    url_prefix="/api/ai",
)

app.register_blueprint(
    notification_bp,
    url_prefix="/api/notifications",
)

app.register_blueprint(
    activity_bp,
    url_prefix="/api",
)

app.register_blueprint(
    analytics_bp,
    url_prefix="/api/analytics",
)

app.register_blueprint(
    upload_bp,
    url_prefix="/api/upload",
)

app.register_blueprint(
    student_bp,
    url_prefix="/api/student",
)

app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin",
)

# IMPORTANT:
# staff_bp already has url_prefix="/api/staff"
# inside staff_routes.py

app.register_blueprint(
    staff_bp
)

app.register_blueprint(
    profile_bp,
    url_prefix="/api/profile",
)


# ==========================================================
# JWT Error Handlers
# ==========================================================

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):

    return {
        "success": False,
        "message": "Token has expired. Please login again.",
    }, 401


@jwt.invalid_token_loader
def invalid_token_callback(error):

    return {
        "success": False,
        "message": "Invalid authentication token.",
    }, 401


@jwt.unauthorized_loader
def missing_token_callback(error):

    return {
        "success": False,
        "message": "Authorization token is required.",
    }, 401


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):

    return {
        "success": False,
        "message": "Token has been revoked.",
    }, 401


# ==========================================================
# Error Handlers
# ==========================================================

@app.errorhandler(404)
def not_found(error):

    return {
        "success": False,
        "message": "Requested route not found.",
    }, 404


@app.errorhandler(405)
def method_not_allowed(error):

    return {
        "success": False,
        "message": "Method not allowed.",
    }, 405


@app.errorhandler(500)
def internal_server_error(error):

    logging.exception(error)

    return {
        "success": False,
        "message": "Internal Server Error.",
    }, 500


# ==========================================================
# Uploads
# ==========================================================

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename,
    )


# ==========================================================
# Health Check
# ==========================================================

@app.route("/")
def health_check():

    return {
        "success": True,
        "message": "CampusAI Backend Running",
        "version": "1.0.0",
    }


# ==========================================================
# Create Tables (Development Only)
# ==========================================================

with app.app_context():
    db.create_all()


# ==========================================================
# Run Server
# ==========================================================

if __name__ == "__main__":

    logging.info("Starting CampusAI Backend...")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )