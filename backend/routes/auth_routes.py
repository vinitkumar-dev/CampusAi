from flask import Blueprint, request, jsonify

from services.auth_service import AuthService
from utils.jwt_helper import generate_token

auth_bp = Blueprint("auth", __name__)


def error_response(message, status):
    return jsonify({
        "success": False,
        "message": message
    }), status


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    """
    try:
        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Request body must be valid JSON.",
                400
            )

        response, status = AuthService.register(data)

        return jsonify(response), status

    except Exception as e:
        return error_response(
            f"Registration failed: {str(e)}",
            500
        )


@auth_bp.route("/login", methods=["POST"])
def login():

    try:
        data = request.get_json(silent=True)

        print("LOGIN DATA:", data)

        result = AuthService.login(data)

        print("AUTH RESULT:", result)

        if isinstance(result, tuple):
            response, status = result
            return jsonify(response), status

        user = result

        print("USER:", user)

        token = generate_token(user)

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "token": token,
            "user": user.to_dict()
        }),200


    except Exception as e:
        import traceback
        traceback.print_exc()

        return error_response(
            f"Login failed: {str(e)}",
            500
        )