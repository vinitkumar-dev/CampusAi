import logging

from sqlalchemy import func

from database.db import db
from models.complaint_model import Complaint
from models.user_model import User
from models.notification_model import Notification

logger = logging.getLogger(__name__)


class StaffService:

    # ============================================
    # Dashboard
    # ============================================

    @staticmethod
    def get_dashboard(staff_id):

        total = Complaint.query.filter_by(
            assigned_to=staff_id,
            is_deleted=False
        ).count()

        pending = Complaint.query.filter(
            Complaint.assigned_to == staff_id,
            Complaint.status.in_(["Open", "Assigned"]),
            Complaint.is_deleted == False
        ).count()

        progress = Complaint.query.filter_by(
            assigned_to=staff_id,
            status="In Progress",
            is_deleted=False
        ).count()

        resolved = Complaint.query.filter_by(
            assigned_to=staff_id,
            status="Resolved",
            is_deleted=False
        ).count()

        unread = Notification.query.filter_by(
            user_id=staff_id,
            is_read=False
        ).count()

        recent = Complaint.query.filter_by(
            assigned_to=staff_id,
            is_deleted=False
        ).order_by(
            Complaint.updated_at.desc()
        ).limit(5).all()

        return {
            "total": total,
            "pending": pending,
            "in_progress": progress,
            "resolved": resolved,
            "unread_notifications": unread,
            "recent": recent
        }

    # ============================================
    # Assigned Complaints
    # ============================================

    @staticmethod
    def get_assigned_complaints(staff_id):

        return Complaint.query.filter_by(
            assigned_to=staff_id,
            is_deleted=False
        ).order_by(
            Complaint.created_at.desc()
        ).all()

    # ============================================
    # Complaint Details
    # ============================================

    @staticmethod
    def get_complaint(staff_id, complaint_id):

        return Complaint.query.filter_by(
            id=complaint_id,
            assigned_to=staff_id,
            is_deleted=False
        ).first()

    # ============================================
    # Update Complaint Status
    # ============================================

    @staticmethod
    def update_status(staff_id, complaint_id, data):

        complaint = Complaint.query.filter_by(
            id=complaint_id,
            assigned_to=staff_id,
            is_deleted=False
        ).first()

        if not complaint:
            return None

        if data.get("status"):
            complaint.status = data["status"]

        db.session.commit()

        return complaint

    # ============================================
    # Analytics
    # ============================================

    @staticmethod
    def analytics(staff_id):

        complaints = Complaint.query.filter_by(
            assigned_to=staff_id
        ).all()


        total_assigned = len(complaints)


        completed = len([
            c for c in complaints
            if c.status in [
                "Resolved",
                "Closed"
            ]
        ])


        pending = len([
            c for c in complaints
            if c.status in [
                "Pending",
                "Open"
            ]
        ])


        urgent = len([
            c for c in complaints
            if c.urgency in [
                "High",
                "Urgent"
            ]
        ])


        categories = {}


        for c in complaints:

            category = c.category or "General"

            categories[category] = (
                categories.get(category,0)+1
            )



        category_data = []


        for key,value in categories.items():

            category_data.append({

                "category": key,

                "count": value

            })



        return {

            "totalAssigned": total_assigned,

            "completed": completed,

            "pending": pending,

            "urgent": urgent,

            "categories": category_data

        }