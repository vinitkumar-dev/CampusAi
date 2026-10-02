import logging

from database.db import db
from models.activity_log_model import ActivityLog

logger = logging.getLogger(__name__)


class ActivityLogService:

    @staticmethod
    def create_log(
        complaint_id,
        user_id,
        action,
        description,
        old_value=None,
        new_value=None,
    ):
        try:

            activity = ActivityLog(
                complaint_id=complaint_id,
                user_id=user_id,
                action=action,
                description=description,
                old_value=old_value,
                new_value=new_value,
            )

            db.session.add(activity)
            db.session.commit()

            return activity

        except Exception as e:

            db.session.rollback()

            logger.exception(
                f"Failed to create activity log: {e}"
            )

            raise

    # ------------------------------------------

    @staticmethod
    def complaint_created(
        complaint_id,
        user_id,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="COMPLAINT_CREATED",
            description="Complaint submitted",
        )

    # ------------------------------------------

    @staticmethod
    def complaint_assigned(
        complaint_id,
        user_id,
        department,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="COMPLAINT_ASSIGNED",
            description=f"Assigned to {department}",
            new_value=department,
        )

    # ------------------------------------------

    @staticmethod
    def status_changed(
        complaint_id,
        user_id,
        old_status,
        new_status,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="STATUS_CHANGED",
            description=(
                f"Status changed "
                f"from '{old_status}' "
                f"to '{new_status}'"
            ),
            old_value=old_status,
            new_value=new_status,
        )

    # ------------------------------------------

    @staticmethod
    def complaint_resolved(
        complaint_id,
        user_id,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="COMPLAINT_RESOLVED",
            description="Complaint resolved",
        )

    # ------------------------------------------

    @staticmethod
    def complaint_deleted(
        complaint_id,
        user_id,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="COMPLAINT_DELETED",
            description="Complaint deleted",
        )

    # ------------------------------------------

    @staticmethod
    def complaint_updated(
        complaint_id,
        user_id,
    ):
        return ActivityLogService.create_log(
            complaint_id=complaint_id,
            user_id=user_id,
            action="COMPLAINT_UPDATED",
            description="Complaint updated",
        )

    # ------------------------------------------

    @staticmethod
    def get_timeline(
        complaint_id,
    ):
        try:

            activities = (
                ActivityLog.query
                .filter_by(
                    complaint_id=complaint_id
                )
                .order_by(
                    ActivityLog.created_at.asc()
                )
                .all()
            )

            return [
                activity.to_dict()
                for activity in activities
            ]

        except Exception as e:

            logger.exception(
                f"Failed to fetch activity timeline: {e}"
            )

            return []