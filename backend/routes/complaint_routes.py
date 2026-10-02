from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from middleware.auth_middleware import role_required

from services.complaint_service import ComplaintService
from models.activity_log_model import ActivityLog

complaint_bp = Blueprint(
    "complaints",
    __name__,
)


# ----------------------------------
# Helper Responses
# ----------------------------------

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


# ----------------------------------
# Create Complaint
# ----------------------------------

@complaint_bp.route("", methods=["POST"])
@jwt_required()
@role_required("student")
def create_complaint():
    try:

        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Invalid JSON request.",
                400
            )

        user_id = int(get_jwt_identity())

        response, status = ComplaintService.create_complaint(
            data,
            user_id,
        )

        return jsonify(response), status

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# All Complaints
# ----------------------------------

@complaint_bp.route("", methods=["GET"])
@jwt_required()
@role_required("admin", "staff")
def get_all_complaints():

    try:

        complaints = ComplaintService.get_all_complaints()

        return success_response(
            [c.to_dict() for c in complaints],
            "Complaints fetched successfully.",
        )

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# Student Complaints
# ----------------------------------

@complaint_bp.route("/my", methods=["GET"])
@jwt_required()
@role_required("student")
def get_my_complaints():

    try:

        user_id = int(get_jwt_identity())

        complaints = ComplaintService.get_student_complaints(
            user_id
        )

        return success_response(
            [c.to_dict() for c in complaints],
            "Complaints fetched successfully.",
        )

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# Complaint By ID
# ----------------------------------

@complaint_bp.route("/<int:complaint_id>", methods=["GET"])
@jwt_required()
def get_complaint(complaint_id):

    try:

        complaint = ComplaintService.get_complaint_by_id(
            complaint_id
        )

        if complaint is None:
            return error_response(
                "Complaint not found.",
                404,
            )

        return success_response(
            complaint.to_dict(),
            "Complaint fetched successfully.",
        )

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# Update Complaint
# ----------------------------------

@complaint_bp.route("/<int:complaint_id>", methods=["PUT"])
@jwt_required()
def update_complaint(complaint_id):

    try:

        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Invalid JSON request.",
                400,
            )

        complaint = ComplaintService.update_complaint(
            complaint_id,
            data,
        )

        if complaint is None:
            return error_response(
                "Complaint not found.",
                404,
            )

        return success_response(
            complaint.to_dict(),
            "Complaint updated successfully.",
        )

    except Exception as e:

        import traceback

        traceback.print_exc()

        return error_response(
            str(e),
            500
        )


# ----------------------------------
# Update Status
# ----------------------------------

@complaint_bp.route("/<int:complaint_id>/status", methods=["PUT"])
@jwt_required()
@role_required("admin", "staff")
def update_status(complaint_id):

    try:

        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Invalid JSON request.",
                400,
            )

        status_value = data.get("status")

        if not status_value:
            return error_response(
                "Status is required.",
                400,
            )

        complaint = ComplaintService.update_status(
            complaint_id,
            status_value,
        )

        if complaint is None:
            return error_response(
                "Complaint not found.",
                404,
            )

        return success_response(
            complaint.to_dict(),
            "Status updated successfully.",
        )

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# Assign Complaint
# ----------------------------------

@complaint_bp.route("/<int:complaint_id>/assign", methods=["PUT"])
@jwt_required()
@role_required("admin")
def assign_complaint(complaint_id):

    try:

        data = request.get_json(silent=True)

        if data is None:
            return error_response(
                "Invalid JSON request.",
                400,
            )

        staff_id = data.get("staffId")

        if not staff_id:
            return error_response(
                "staffId is required.",
                400,
            )

        complaint = ComplaintService.assign_complaint(
            complaint_id,
            staff_id,
        )

        if complaint is None:
            return error_response(
                "Complaint not found.",
                404,
            )

        return success_response(
            complaint.to_dict(),
            "Complaint assigned successfully.",
        )

    except Exception as e:
        return error_response(str(e), 500)


# ----------------------------------
# Complaint Timeline
# ----------------------------------

@complaint_bp.route(
    "/<int:complaint_id>/timeline",
    methods=["GET"]
)
@jwt_required()
def get_complaint_timeline(complaint_id):

    try:

        user_id = int(get_jwt_identity())

        complaint = ComplaintService.get_complaint_by_id(
            complaint_id
        )


        if complaint is None:
            return error_response(
                "Complaint not found.",
                404
            )


        logs = ActivityLog.query.filter_by(
            complaint_id=complaint_id
        ).order_by(
            ActivityLog.created_at.asc()
        ).all()


        timeline = []

        for log in logs:

            timeline.append({

                "id": log.id,

                "action": log.action,

                "description": log.description,

                "created_at":
                    log.created_at.isoformat()
                    if log.created_at
                    else None

            })


        return success_response(
            timeline,
            "Timeline fetched successfully."
        )


    except Exception as e:

        import traceback
        traceback.print_exc()

        return error_response(
            str(e),
            500
        )

# ----------------------------------
# Delete Complaint
# ----------------------------------

# ----------------------------------
# Delete Complaint
# ----------------------------------

@complaint_bp.route(
    "/<int:complaint_id>",
    methods=["DELETE"]
)
@jwt_required()
@role_required("student", "admin")
def delete_complaint(complaint_id):

    try:

        user_id = int(get_jwt_identity())


        deleted = ComplaintService.delete_complaint(
            complaint_id,
            user_id
        )


        if not deleted:

            return error_response(
                "Complaint not found or permission denied.",
                404
            )


        return success_response(
            message="Complaint deleted successfully."
        )


    except Exception as e:

        import traceback
        traceback.print_exc()

        return error_response(
            str(e),
            500
        )