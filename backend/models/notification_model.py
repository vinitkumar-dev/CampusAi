from database.db import db


class Notification(db.Model):

    __tablename__ = "notifications"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "complaints.id",
            ondelete="CASCADE"
        ),
        nullable=True,
        index=True
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    is_read = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default="0",
        index=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True
    )


    # ============================
    # RELATIONSHIPS
    # ============================

    user = db.relationship(
        "User",
        backref=db.backref(
            "notifications",
            lazy="dynamic",
            cascade="all, delete-orphan"
        )
    )


    complaint = db.relationship(
        "Complaint",
        backref=db.backref(
            "notifications",
            lazy=True
        )
    )


    # ============================
    # SERIALIZER
    # ============================

    def to_dict(self):

        return {
            "id": self.id,
            "userId": self.user_id,
            "complaintId": self.complaint_id,
            "title": self.title,
            "message": self.message,
            "isRead": bool(self.is_read),
            "createdAt":
                self.created_at.isoformat()
                if self.created_at
                else None
        }


    def __repr__(self):

        return (
            f"<Notification "
            f"id={self.id} "
            f"user={self.user_id} "
            f"read={self.is_read}>"
        )