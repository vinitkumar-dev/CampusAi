from sqlalchemy import func

from models.complaint_model import (
    Complaint,
)

from database.db import db


def _month_expr():
    """YYYY-MM bucket; strftime exists only on SQLite, MySQL needs DATE_FORMAT."""
    if db.engine.dialect.name == "sqlite":
        return func.strftime("%Y-%m", Complaint.created_at)
    return func.date_format(Complaint.created_at, "%Y-%m")


class AnalyticsService:

    @staticmethod
    def dashboard_summary():

        total = (
            Complaint.query.count()
        )

        open_count = (
            Complaint.query.filter_by(
                status="Open"
            ).count()
        )

        in_progress = (
            Complaint.query.filter_by(
                status="In Progress"
            ).count()
        )

        resolved = (
            Complaint.query.filter_by(
                status="Resolved"
            ).count()
        )

        return {
            "totalComplaints":
            total,

            "openComplaints":
            open_count,

            "inProgressComplaints":
            in_progress,

            "resolvedComplaints":
            resolved,
        }

    @staticmethod
    def category_distribution():

        results = (
            db.session.query(
                Complaint.category,

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                Complaint.category
            )
            .all()
        )

        return [
            {
                "category":
                row[0],

                "count":
                row[1],
            }
            for row in results
        ]

    @staticmethod
    def urgency_distribution():

        results = (
            db.session.query(
                Complaint.urgency,

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                Complaint.urgency
            )
            .all()
        )

        return [
            {
                "urgency":
                row[0],

                "count":
                row[1],
            }
            for row in results
        ]

    @staticmethod
    def status_distribution():

        results = (
            db.session.query(
                Complaint.status,

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                Complaint.status
            )
            .all()
        )

        return [
            {
                "status":
                row[0],

                "count":
                row[1],
            }
            for row in results
        ]

    @staticmethod
    def monthly_trends():

        results = (
            db.session.query(
                _month_expr(),

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                _month_expr()
            )
            .order_by(
                _month_expr()
            )
            .all()
        )

        return [
            {
                "month":
                row[0],

                "count":
                row[1],
            }
            for row in results
        ]

    @staticmethod
    def department_workload():

        results = (
            db.session.query(
                Complaint.category,

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                Complaint.category
            )
            .all()
        )

        return [
            {
                "department":
                row[0],

                "complaints":
                row[1],
            }
            for row in results
        ]