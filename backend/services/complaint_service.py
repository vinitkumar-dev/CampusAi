

import logging

from database.db import db

from models.complaint_model import Complaint
from models.user_model import User

from services.ai_service import AIService
from services.activity_log_service import ActivityLogService
from services.notification_service import NotificationService


logger = logging.getLogger(__name__)


class ComplaintService:


    # =====================================================
    # CREATE COMPLAINT
    # =====================================================

    @staticmethod
    def create_complaint(data, user_id):

        try:

            title = data.get("title", "").strip()
            description = data.get("description", "").strip()


            if not title:
                return {
                    "success": False,
                    "message": "Title is required."
                }, 400


            if not description:
                return {
                    "success": False,
                    "message": "Description is required."
                }, 400



            image_url = data.get("image_url")



            complaint_text = (
                f"{title} {description}"
            )



            # ==========================
            # AI PREDICTION
            # ==========================

            try:

                ai_result = AIService.analyze_complaint(
                    complaint_text
                )


            except Exception as e:

                logger.exception(e)

                ai_result = {

                    "category": "General",

                    "urgency": "Medium",

                    "department": None,

                    "resolutionTime": None,

                }



            complaint = Complaint(

                title=title,

                description=description,

                category=(
                    ai_result.get("category")
                    or "General"
                ),

                urgency=(
                    ai_result.get("urgency")
                    or "Medium"
                ),

                predicted_category=
                ai_result.get("category"),


                predicted_urgency=
                ai_result.get("urgency"),


                image_url=image_url,

                created_by=user_id,

                status="Open"

            )



            db.session.add(complaint)

            db.session.commit()



            # ==========================
            # ACTIVITY LOG
            # ==========================

            try:

                ActivityLogService.complaint_created(
                    complaint.id,
                    user_id
                )

            except Exception as e:

                logger.exception(e)



            # ==========================
            # STUDENT NOTIFICATION
            # ==========================

            try:

                NotificationService.complaint_created(
                    user_id,
                    complaint
                )


            except Exception as e:

                logger.exception(e)



            # ==========================
            # ADMIN NOTIFICATION
            # ==========================

            try:

                admins = User.query.filter_by(
                    role="admin"
                ).all()


                for admin in admins:

                    NotificationService.admin_new_complaint(
                        admin.id,
                        complaint
                    )


            except Exception as e:

                logger.exception(e)




            return {

                "success": True,

                "message":
                "Complaint created successfully.",

                "data": {

                    "complaintId":
                    complaint.id,

                    "category":
                    complaint.category,

                    "urgency":
                    complaint.urgency

                }

            }, 201



        except Exception as e:

            db.session.rollback()

            logger.exception(e)


            return {

                "success": False,

                "message":
                "Failed to create complaint."

            },500






    # =====================================================
    # GET STUDENT COMPLAINTS
    # =====================================================

    @staticmethod
    def get_student_complaints(user_id):

        return (

            Complaint.query

            .filter_by(
                created_by=user_id,
                is_deleted=False
            )

            .order_by(
                Complaint.created_at.desc()
            )

            .all()

        )





    # =====================================================
    # GET ALL COMPLAINTS
    # =====================================================

    @staticmethod
    def get_all_complaints():

        return (

            Complaint.query

            .filter_by(
                is_deleted=False
            )

            .order_by(
                Complaint.created_at.desc()
            )

            .all()

        )





    # =====================================================
    # GET BY ID
    # =====================================================

    @staticmethod
    def get_complaint_by_id(complaint_id):

        return (

            Complaint.query

            .filter_by(
                id=complaint_id,
                is_deleted=False
            )

            .first()

        )





    # =====================================================
    # UPDATE COMPLAINT
    # =====================================================

    @staticmethod
    def update_complaint(
        complaint_id,
        data
    ):

        complaint = Complaint.query.get(
            complaint_id
        )


        if not complaint:
            return None



        if "title" in data:

            complaint.title=data["title"]



        if "description" in data:

            complaint.description=data["description"]



        if "image_url" in data:

            complaint.image_url=data["image_url"]



        db.session.commit()


        return complaint





    # =====================================================
    # UPDATE STATUS
    # =====================================================

    @staticmethod
    def update_status(
        complaint_id,
        status
    ):

        complaint = Complaint.query.get(
            complaint_id
        )


        if not complaint:

            return None



        complaint.status = status


        db.session.commit()



        # Student notification

        try:

            NotificationService.status_updated(
                complaint.created_by,
                complaint,
                status
            )


        except Exception as e:

            logger.exception(e)



        # Resolved notification

        if status.lower() == "resolved":

            try:

                NotificationService.complaint_resolved(
                    complaint.created_by,
                    complaint
                )


            except Exception as e:

                logger.exception(e)



        return complaint





    # =====================================================
    # ASSIGN COMPLAINT
    # =====================================================

    @staticmethod
    def assign_complaint(
        complaint_id,
        staff_id
    ):


        complaint = Complaint.query.get(
            complaint_id
        )


        if not complaint:

            return None



        complaint.assigned_to = staff_id

        complaint.status = "Assigned"



        db.session.commit()



        # Staff notification

        try:

            NotificationService.staff_assigned(
                staff_id,
                complaint
            )


        except Exception as e:

            logger.exception(e)



        return complaint





    # =====================================================
    # DELETE COMPLAINT
    # =====================================================

    @staticmethod
    def delete_complaint(
        complaint_id,
        user_id
    ):

        complaint = Complaint.query.filter_by(

            id=complaint_id,

            created_by=user_id,

            is_deleted=False

        ).first()



        if not complaint:

            return False



        complaint.is_deleted=True


        db.session.commit()


        return True