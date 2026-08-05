from sqlalchemy import func

from models.complaint_model import (
    Complaint,
)

from database.db import db


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
                func.strftime(
                    "%Y-%m",
                    Complaint.created_at
                ),

                func.count(
                    Complaint.id
                ),
            )
            .group_by(
                func.strftime(
                    "%Y-%m",
                    Complaint.created_at
                )
            )
            .order_by(
                func.strftime(
                    "%Y-%m",
                    Complaint.created_at
                )
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