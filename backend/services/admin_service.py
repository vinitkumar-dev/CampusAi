import logging

from database.db import db

from models.user_model import User
from models.complaint_model import Complaint
from models.notification_model import Notification


from models.settings_model import SystemSettings
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import check_password_hash
from services.notification_service import NotificationService
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)


logger = logging.getLogger(__name__)


class AdminService:


    # ==============================
    # ADMIN DASHBOARD
    # ==============================

    @staticmethod
    def dashboard():

        total_complaints = Complaint.query.filter_by(
            is_deleted=False
        ).count()


        pending = Complaint.query.filter(
            Complaint.status.in_(
                [
                    "Open",
                    "Assigned",
                    "Pending",
                    "In Progress"
                ]
            ),
            Complaint.is_deleted == False
        ).count()


        resolved = Complaint.query.filter_by(
            status="Resolved",
            is_deleted=False
        ).count()


        total_students = User.query.filter_by(
            role="student"
        ).count()


        total_staff = User.query.filter_by(
            role="staff"
        ).count()


        return {

            "total_complaints": total_complaints,

            "pending_complaints": pending,

            "resolved_complaints": resolved,

            "students": total_students,

            "staff": total_staff

        }



    # ==============================
    # ALL COMPLAINTS
    # ==============================

    @staticmethod
    def get_complaints():

        return Complaint.query.filter_by(
            is_deleted=False
        ).order_by(
            Complaint.created_at.desc()
        ).all()



    # ==============================
    # COMPLAINT DETAILS
    # ==============================

    @staticmethod
    def complaint_details(id):

        return Complaint.query.filter_by(
            id=id,
            is_deleted=False
        ).first()



    # ==============================
    # DELETE COMPLAINT
    # ==============================

    @staticmethod
    def delete_complaint(id):

        complaint = Complaint.query.filter_by(
            id=id
        ).first()


        if not complaint:
            return None


        # Soft delete
        complaint.is_deleted = True


        db.session.commit()


        return complaint





        # ==============================
    # ASSIGN STAFF
    # ==============================

    @staticmethod
    def assign_staff(
        complaint_id,
        staff_id
    ):

        try:

            complaint = Complaint.query.get(
                complaint_id
            )

            if not complaint:
                return None

            # Verify staff exists
            staff = User.query.filter_by(
                id=staff_id,
                role="staff"
            ).first()

            if not staff:
                return None

            complaint.assigned_to = staff_id
            complaint.status = "Assigned"

            db.session.commit()

            # --------------------------------
            # Notify Staff
            # --------------------------------
            try:

                NotificationService.staff_assigned(
                    staff.id,
                    complaint
                )

            except Exception as e:
                logger.exception(
                    f"Staff notification failed: {e}"
                )

            # --------------------------------
            # Notify Student
            # --------------------------------
            try:

                NotificationService.complaint_assigned(
                    complaint.created_by,
                    complaint,
                    staff.department or "Assigned Staff"
                )

            except Exception as e:
                logger.exception(
                    f"Student notification failed: {e}"
                )

            return complaint

        except Exception as e:

            db.session.rollback()

            logger.exception(e)

            return None





    # ==============================
    # STAFF LIST
    # ==============================

    @staticmethod
    def get_staff():

        return User.query.filter_by(
            role="staff"
        ).all()





    # ==============================
    # ACTIVATE / DEACTIVATE STAFF
    # ==============================

    @staticmethod
    def toggle_staff(id):

        staff = User.query.get(id)


        if not staff:

            return None



        staff.is_active = not staff.is_active


        db.session.commit()


        return staff





    # ==============================
    # ANALYTICS
    # ==============================

    @staticmethod
    def analytics():


        categories = db.session.query(
            Complaint.category,
            db.func.count(
                Complaint.id
            )
        ).filter(
            Complaint.is_deleted == False
        ).group_by(
            Complaint.category
        ).all()



        status = db.session.query(
            Complaint.status,
            db.func.count(
                Complaint.id
            )
        ).filter(
            Complaint.is_deleted == False
        ).group_by(
            Complaint.status
        ).all()



        return {


            "category": [

                {
                    "name": x[0],
                    "count": x[1]
                }

                for x in categories

            ],


            "status": [

                {
                    "name": x[0],
                    "count": x[1]
                }

                for x in status

            ]

        }





    # ==============================
    # UPDATE ADMIN PROFILE
    # ==============================

    @staticmethod
    def update_profile(
        user_id,
        data
    ):


        user = User.query.get(
            user_id
        )


        if not user:

            return None



        user.name = data.get(
            "name",
            user.name
        )


        user.phone = data.get(
            "phone",
            user.phone
        )


        user.department = data.get(
            "department",
            user.department
        )


        user.profile_image = data.get(
            "profile_image",
            user.profile_image
        )


        user.bio = data.get(
            "bio",
            user.bio
        )



        db.session.commit()


        return user
    
    @staticmethod
    def create_staff(data):

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not name or not email or not password:
            return {
                "success": False,
                "message": "All fields are required."
            }

        if User.query.filter_by(email=email).first():
            return {
                "success": False,
                "message": "Email already exists."
            }

        staff = User(
            name=name,
            email=email,
            role="staff",
            phone=data.get("phone"),
            department=data.get("department"),
            is_active=True
        )

        staff.password = generate_password_hash(password)

        db.session.add(staff)
        db.session.commit()

        return {
            "success": True,
            "message": "Staff created successfully.",
            "staff": staff.to_dict()
        }
    
    @staticmethod
    def update_staff(staff_id, data):

        staff = User.query.filter_by(
            id=staff_id,
            role="staff"
        ).first()

        if not staff:
            return None

        staff.name = data.get("name", staff.name)
        staff.phone = data.get("phone", staff.phone)
        staff.department = data.get("department", staff.department)
        staff.email = data.get("email", staff.email).lower()

        db.session.commit()

        return staff
    
    @staticmethod
    def delete_staff(staff_id):

        staff = User.query.filter_by(
            id=staff_id,
            role="staff"
        ).first()

        if not staff:
            return False

        db.session.delete(staff)
        db.session.commit()

        return True
    
    @staticmethod
    def get_students():

        return User.query.filter_by(
            role="student"
        ).all()
    

    @staticmethod
    def get_users():

        return User.query.order_by(
            User.created_at.desc()
        ).all()
    
        # ==============================
    # SYSTEM SETTINGS
    # ==============================

    @staticmethod
    def get_settings():

        settings = SystemSettings.query.first()


        if not settings:

            settings = SystemSettings(
                ai_enabled=True,
                notification_enabled=True
            )

            db.session.add(settings)
            db.session.commit()


        return settings.to_dict()



    @staticmethod
    def update_settings(data):

        settings = SystemSettings.query.first()


        if not settings:

            settings = SystemSettings()

            db.session.add(settings)


        settings.ai_enabled = data.get(
            "aiEnabled",
            settings.ai_enabled
        )


        settings.notification_enabled = data.get(
            "notification",
            settings.notification_enabled
        )


        db.session.commit()


        return settings.to_dict()



    # ==============================
    # ADMIN CHANGE PASSWORD
    # ==============================

    @staticmethod
    def change_password(data):

        identity = get_jwt_identity()


        if isinstance(identity, dict):
            admin_id = identity.get("id")
        else:
            admin_id = identity


        admin = User.query.get(
            admin_id
        )


        if not admin:

            return {
                "success":False,
                "message":"Admin not found"
            }


        old_password = data.get("old_password")
        new_password = data.get("new_password")


        if not old_password or not new_password:
            return {
                "success": False,
                "message": "Old password and new password are required."
            }


        if not check_password_hash(
            admin.password,
            old_password
        ):

            return {
                "success":False,
                "message":"Old password incorrect"
            }



        admin.password = generate_password_hash(
            new_password
        )


        db.session.commit()


        return {
            "success":True,
            "message":"Password changed successfully"
        }