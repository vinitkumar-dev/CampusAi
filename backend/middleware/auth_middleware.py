from functools import wraps
import logging

from flask import jsonify
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt,
)

logging.basicConfig(level=logging.INFO)


def role_required(*allowed_roles):
    """
    Restrict access to one or more user roles.

    Example:
        @role_required("admin")

        @role_required("admin", "staff")
    """

    allowed_roles = {
        role.lower() for role in allowed_roles
    }

    def wrapper(fn):

        @wraps(fn)
        def decorator(*args, **kwargs):

            try:
                # Verify JWT
                verify_jwt_in_request()

                claims = get_jwt()

                user_role = claims.get("role")

                if not user_role:
                    return jsonify({
                        "success": False,
                        "message": "Role not found in token."
                    }), 401

                if user_role.lower() not in allowed_roles:

                    logging.warning(
                        f"Unauthorized access attempt by role: {user_role}"
                    )

                    return jsonify({
                        "success": False,
                        "message": "Access denied."
                    }), 403

                return fn(*args, **kwargs)

            except Exception as e:

                logging.exception(e)

                return jsonify({
                    "success": False,
                    "message": "Authentication failed."
                }), 401

        return decorator

    return wrapper