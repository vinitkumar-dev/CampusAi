from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from services.profile_service import ProfileService

profile_bp = Blueprint(
    "profile",
    __name__,
)


# -----------------------------------
# Helper Responses
# -----------------------------------

def success_response(data=None, message="", status=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status


def error_response(message="", status=400):
    return jsonify({
        "success": False,
        "message": message,
    }), status


# -----------------------------------
# Get Profile
# -----------------------------------

@profile_bp.route("", methods=["GET"])
@jwt_required()
def get_profile():

    try:

        user_id = int(get_jwt_identity())

        profile = ProfileService.get_profile(user_id)

        if profile is None:
            return error_response(
                "User not found.",
                404,
            )

        return success_response(
            profile,
            "Profile fetched successfully.",
        )

    except Exception as e:

        return error_response(
            str(e),
            500,
        )


# -----------------------------------
# Update Profile
# -----------------------------------

@profile_bp.route("", methods=["PUT"])
@jwt_required()
def update_profile():

    try:

        user_id = int(get_jwt_identity())

        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Invalid JSON request.",
                400,
            )

        profile = ProfileService.update_profile(
            user_id,
            data,
        )

        if profile is None:
            return error_response(
                "User not found.",
                404,
            )

        return success_response(
            profile,
            "Profile updated successfully.",
        )

    except Exception as e:

        return error_response(
            str(e),
            500,
        )