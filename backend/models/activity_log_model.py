from database.db import db


class ActivityLog(db.Model):

    __tablename__ = "activity_logs"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "complaints.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    action = db.Column(
        db.String(50),
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=False,
    )

    old_value = db.Column(
        db.String(255),
        nullable=True,
    )

    new_value = db.Column(
        db.String(255),
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True,
    )

    complaint = db.relationship(
        "Complaint",
        backref=db.backref(
            "activity_logs",
            lazy=True,
            cascade="all, delete-orphan",
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "activities",
            lazy=True,
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "complaintId": self.complaint_id,
            "userId": self.user_id,
            "action": self.action,
            "description": self.description,
            "oldValue": self.old_value,
            "newValue": self.new_value,
            "createdAt": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }

    def __repr__(self):
        return (
            f"<ActivityLog "
            f"id={self.id} "
            f"complaint={self.complaint_id} "
            f"user={self.user_id} "
            f"action='{self.action}'>"
        )