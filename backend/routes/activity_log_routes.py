from flask import (
    Blueprint,
    jsonify,
)

from flask_jwt_extended import (
    jwt_required,
)

from middleware.auth_middleware import (
    role_required,
)

from services.activity_log_service import (
    ActivityLogService,
)

activity_bp = Blueprint(
    "activity",
    __name__,
)


# ----------------------------------------
# Helper Responses
# ----------------------------------------

def success_response(data=None, message="", status=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status


def error_response(message, status=400):
    return jsonify({
        "success": False,
        "message": message,
    }), status


# ----------------------------------------
# Complaint Timeline
# ----------------------------------------

@activity_bp.route(
    "/complaints/<int:complaint_id>/timeline",
    methods=["GET"],
)
@jwt_required()
@role_required("admin", "staff")
def get_timeline(complaint_id):

    try:

        timeline = ActivityLogService.get_timeline(
            complaint_id
        )

        return success_response(
            {
                "count": len(timeline),
                "timeline": timeline,
            },
            "Timeline fetched successfully.",
        )

    except Exception as e:

        return error_response(
            str(e),
            500,
        )