from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from services.analytics_service import AnalyticsService
from middleware.auth_middleware import role_required


analytics_bp = Blueprint(
    "analytics",
    __name__,
)


def success_response(data):
    return jsonify(
        {
            "status": "success",
            "data": data,
        }
    ), 200


def error_response(message):
    return jsonify(
        {
            "status": "error",
            "message": message,
        }
    ), 500



# ======================================================
# ADMIN ANALYTICS SUMMARY
# ======================================================

@analytics_bp.route(
    "/summary",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def dashboard_summary():

    try:
        data = AnalyticsService.dashboard_summary()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )



# ======================================================
# CATEGORY DISTRIBUTION
# ======================================================

@analytics_bp.route(
    "/categories",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def category_distribution():

    try:
        data = AnalyticsService.category_distribution()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )



# ======================================================
# URGENCY DISTRIBUTION
# ======================================================

@analytics_bp.route(
    "/urgency",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def urgency_distribution():

    try:
        data = AnalyticsService.urgency_distribution()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )



# ======================================================
# STATUS DISTRIBUTION
# ======================================================

@analytics_bp.route(
    "/status",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def status_distribution():

    try:
        data = AnalyticsService.status_distribution()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )



# ======================================================
# MONTHLY TREND ANALYTICS
# ======================================================

@analytics_bp.route(
    "/monthly-trends",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def monthly_trends():

    try:
        data = AnalyticsService.monthly_trends()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )



# ======================================================
# DEPARTMENT WORKLOAD
# ======================================================

@analytics_bp.route(
    "/department-workload",
    methods=["GET"],
)
@jwt_required()
@role_required("admin")
def department_workload():

    try:
        data = AnalyticsService.department_workload()

        return success_response(data)

    except Exception as e:
        return error_response(
            str(e)
        )