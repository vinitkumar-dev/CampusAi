from flask import (
    Blueprint,
    jsonify
)

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models.user_model import User
from models.complaint_model import Complaint
from models.activity_log_model import ActivityLog

student_bp = Blueprint(
    "student",
    __name__
)

@student_bp.route(
    "/dashboard",
    methods=["GET"]
)
@jwt_required()
def student_dashboard():

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    complaints = Complaint.query.filter_by(
        created_by=user_id
    ).all()

    open_count = len([
        c for c in complaints
        if c.status in ("Open", "Assigned", "In Progress")
    ])

    resolved_count = len([
        c for c in complaints
        if c.status == "Resolved"
    ])

    critical_count = len([
        c for c in complaints
        if c.urgency == "Critical"
        and c.status != "Resolved"
    ])

    # -----------------------------
    # Recent Activity
    # -----------------------------
    complaint_ids = [c.id for c in complaints]

    recent_logs = (
        ActivityLog.query
        .filter(ActivityLog.complaint_id.in_(complaint_ids))
        .order_by(ActivityLog.created_at.desc())
        .limit(5)
        .all()
        if complaint_ids else []
    )

    recent_activity = [
        {
            "id": log.id,
            "message": log.description,
            "time": (
                log.created_at.isoformat()
                if log.created_at else None
            ),
        }
        for log in recent_logs
    ]

    return jsonify({
        "name": user.name,

        "overview": {
            "open": open_count,
            "resolved": resolved_count,
            "critical": critical_count,
            "total": len(complaints),
        },

        "recentActivity": recent_activity,
    })
