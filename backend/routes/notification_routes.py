from flask import Blueprint, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from services.notification_service import NotificationService


notification_bp = Blueprint(
    "notifications",
    __name__,
)


# =====================================================
# GET ALL NOTIFICATIONS
# =====================================================

@notification_bp.route(
    "",
    methods=["GET"]
)
@notification_bp.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_notifications():

    try:

        user_id = int(
            get_jwt_identity()
        )


        notifications = (
            NotificationService
            .get_user_notifications(
                user_id
            )
        )


        return jsonify(
            {
                "status": "success",
                "data": notifications
            }
        ), 200


    except Exception as e:

        return jsonify(
            {
                "status": "error",
                "message": str(e)
            }
        ), 500



# =====================================================
# UNREAD COUNT
# =====================================================

@notification_bp.route(
    "/unread-count",
    methods=["GET"]
)
@jwt_required()
def unread_count():

    try:

        user_id = int(
            get_jwt_identity()
        )


        count = (
            NotificationService
            .unread_count(
                user_id
            )
        )


        return jsonify(
            {
                "status": "success",
                "data": count
            }
        ), 200


    except Exception as e:

        return jsonify(
            {
                "status": "error",
                "message": str(e)
            }
        ), 500



# =====================================================
# MARK READ
# =====================================================

@notification_bp.route(
    "/<int:id>/read",
    methods=["PUT"]
)
@jwt_required()
def mark_as_read(id):

    try:

        user_id = int(
            get_jwt_identity()
        )


        notification = (
            NotificationService
            .mark_as_read(
                id,
                user_id
            )
        )


        if not notification:

            return jsonify(
                {
                    "status": "error",
                    "message":
                    "Notification not found"
                }
            ), 404



        return jsonify(
            {
                "status": "success",
                "data": notification
            }
        ), 200


    except Exception as e:

        return jsonify(
            {
                "status": "error",
                "message": str(e)
            }
        ), 500