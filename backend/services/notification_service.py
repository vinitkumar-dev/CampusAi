import logging

from database.db import db
from models.notification_model import Notification

logger = logging.getLogger(__name__)


class NotificationService:


    # =====================================================
    # CREATE NOTIFICATION
    # =====================================================

    @staticmethod
    def create_notification(
        user_id,
        title,
        message,
        complaint_id=None,
    ):

        try:

            notification = Notification(
                user_id=user_id,
                complaint_id=complaint_id,
                title=title,
                message=message,
                is_read=False,
            )

            db.session.add(notification)
            db.session.commit()

            return notification.to_dict()


        except Exception as e:

            db.session.rollback()

            logger.exception(
                f"Notification creation failed: {e}"
            )

            raise



    # =====================================================
    # STUDENT COMPLAINT CREATED
    # =====================================================

    @staticmethod
    def complaint_created(
        user_id,
        complaint,
    ):

        return NotificationService.create_notification(

            user_id=user_id,

            complaint_id=complaint.id,

            title="Complaint Submitted",

            message=(
                f"Your complaint "
                f"'{complaint.title}' "
                f"has been submitted successfully."
            ),
        )



    # =====================================================
    # ADMIN NEW COMPLAINT
    # =====================================================

    @staticmethod
    def admin_new_complaint(
        admin_id,
        complaint,
    ):

        return NotificationService.create_notification(

            user_id=admin_id,

            complaint_id=complaint.id,

            title="New Complaint Received",

            message=(
                f"A new complaint "
                f"'{complaint.title}' "
                f"has been submitted."
            ),
        )



    # =====================================================
    # STAFF ASSIGNED
    # =====================================================

    @staticmethod
    def staff_assigned(
        staff_id,
        complaint,
    ):

        return NotificationService.create_notification(

            user_id=staff_id,

            complaint_id=complaint.id,

            title="New Complaint Assigned",

            message=(
                f"You have been assigned complaint "
                f"'{complaint.title}'."
            ),
        )



    # =====================================================
    # COMPLAINT ASSIGNED
    # =====================================================

    @staticmethod
    def complaint_assigned(
        user_id,
        complaint,
        department,
    ):

        return NotificationService.create_notification(

            user_id=user_id,

            complaint_id=complaint.id,

            title="Complaint Assigned",

            message=(
                f"Complaint '{complaint.title}' "
                f"has been assigned to {department}."
            ),
        )



    # =====================================================
    # STATUS UPDATED
    # =====================================================

    @staticmethod
    def status_updated(
        user_id,
        complaint,
        status,
    ):

        return NotificationService.create_notification(

            user_id=user_id,

            complaint_id=complaint.id,

            title="Status Updated",

            message=(
                f"Complaint '{complaint.title}' "
                f"status changed to {status}."
            ),
        )



    # =====================================================
    # COMPLAINT RESOLVED
    # =====================================================

    @staticmethod
    def complaint_resolved(
        user_id,
        complaint,
    ):

        return NotificationService.create_notification(

            user_id=user_id,

            complaint_id=complaint.id,

            title="Complaint Resolved",

            message=(
                f"Complaint '{complaint.title}' "
                f"has been resolved."
            ),
        )



    # =====================================================
    # GET USER NOTIFICATIONS
    # =====================================================

    @staticmethod
    def get_user_notifications(
        user_id,
    ):

        try:

            notifications = (

                Notification.query

                .filter_by(
                    user_id=user_id
                )

                .order_by(
                    Notification.created_at.desc()
                )

                .all()
            )


            return [
                notification.to_dict()
                for notification in notifications
            ]


        except Exception as e:

            logger.exception(
                f"Fetching notifications failed: {e}"
            )

            return []



    # =====================================================
    # MARK SINGLE NOTIFICATION READ
    # =====================================================

    @staticmethod
    def mark_as_read(
        notification_id,
        user_id,
    ):

        try:

            notification = (

                Notification.query

                .filter_by(

                    id=notification_id,

                    user_id=user_id

                )

                .first()

            )


            if not notification:

                return None



            notification.is_read = True


            db.session.commit()


            return notification.to_dict()



        except Exception as e:

            db.session.rollback()


            logger.exception(e)


            return None



    # =====================================================
    # MARK ALL READ
    # =====================================================

    @staticmethod
    def mark_all_as_read(
        user_id,
    ):

        try:

            Notification.query.filter_by(

                user_id=user_id,

                is_read=False

            ).update(

                {
                    "is_read": True
                }

            )


            db.session.commit()


            return True



        except Exception as e:


            db.session.rollback()


            logger.exception(e)


            return False



    # =====================================================
    # UNREAD COUNT
    # =====================================================

    @staticmethod
    def unread_count(
        user_id,
    ):

        try:

            return (

                Notification.query

                .filter_by(

                    user_id=user_id,

                    is_read=False

                )

                .count()

            )


        except Exception as e:


            logger.exception(e)


            return 0



    # =====================================================
    # DELETE NOTIFICATION
    # =====================================================

    @staticmethod
    def delete_notification(
        notification_id,
        user_id,
    ):

        try:

            notification = (

                Notification.query

                .filter_by(

                    id=notification_id,

                    user_id=user_id

                )

                .first()

            )


            if not notification:

                return False



            db.session.delete(notification)


            db.session.commit()


            return True



        except Exception as e:


            db.session.rollback()


            logger.exception(e)


            return False