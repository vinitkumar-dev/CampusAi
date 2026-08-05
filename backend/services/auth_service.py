import re

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from database.db import db
from models.user_model import User


class AuthService:

    EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    ALLOWED_LOGIN_ROLES = {"student", "staff", "admin"}

    @staticmethod
    def _response(success, message, data=None, errors=None):
        return {
            "success": success,
            "message": message,
            "data": data,
            "errors": errors,
        }

    @staticmethod
    def register(data):
        try:
            name = str(data.get("name", "")).strip()
            email = str(data.get("email", "")).strip().lower()
            password = str(data.get("password", "")).strip()
            role = str(data.get("role", "student")).strip().lower()

            # -----------------------
            # Validation
            # -----------------------

            if not name or not email or not password:
                return AuthService._response(
                    False,
                    "All fields are required.",
                    errors={
                        "name": "Required" if not name else None,
                        "email": "Required" if not email else None,
                        "password": "Required" if not password else None,
                    },
                ), 400

            if not re.match(AuthService.EMAIL_REGEX, email):
                return AuthService._response(
                    False,
                    "Invalid email address.",
                    errors={"email": "Invalid email format"},
                ), 400

            if len(password) < 8:
                return AuthService._response(
                    False,
                    "Password must be at least 8 characters.",
                    errors={"password": "Minimum length is 8"},
                ), 400

            # Self registration is allowed only for students
            if role != "student":
                return AuthService._response(
                    False,
                    "Only students can self register.",
                    errors={"role": "Invalid registration role"},
                ), 403

            existing_user = User.query.filter_by(email=email).first()

            if existing_user:
                return AuthService._response(
                    False,
                    "Email already exists.",
                    errors={"email": "Already registered"},
                ), 409

            user = User(
                name=name,
                email=email,
                role="student",
            )

            if hasattr(user, "set_password"):
                user.set_password(password)
            else:
                user.password = generate_password_hash(password)

            db.session.add(user)
            db.session.commit()

            return AuthService._response(
                True,
                "User registered successfully.",
                data={
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                },
            ), 201

        except Exception:
            db.session.rollback()

            return AuthService._response(
                False,
                "Registration failed due to an internal server error.",
            ), 500

    @staticmethod
    def login(data):
        try:
            email = str(data.get("email", "")).strip().lower()
            password = str(data.get("password", "")).strip()

            if not email or not password:
                return AuthService._response(
                    False,
                    "Email and password are required.",
                    errors={
                        "email": "Required" if not email else None,
                        "password": "Required" if not password else None,
                    },
                ), 400

            user = User.query.filter_by(email=email).first()

            if not user:
                return AuthService._response(
                    False,
                    "Invalid email or password.",
                ), 401

            if getattr(user, "is_deleted", False):
                return AuthService._response(
                    False,
                    "Account not found.",
                ), 401

            if hasattr(user, "is_active") and not user.is_active:
                return AuthService._response(
                    False,
                    "Account has been disabled.",
                ), 403

            if user.role not in AuthService.ALLOWED_LOGIN_ROLES:
                return AuthService._response(
                    False,
                    "Unauthorized role.",
                ), 403

            if hasattr(user, "check_password"):
                valid = user.check_password(password)
            else:
                valid = check_password_hash(user.password, password)

            if not valid:
                return AuthService._response(
                    False,
                    "Invalid email or password.",
                ), 401

            # Keep backward compatibility.
            # Auth controller/JWT helper expects the User object.
            return user

        except Exception:
            return AuthService._response(
                False,
                "Login failed due to an internal server error.",
            ), 500