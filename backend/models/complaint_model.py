from database.db import db


class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    category = db.Column(
        db.String(100),
        nullable=False,
        index=True
    )

    urgency = db.Column(
        db.Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="urgency_levels"
        ),
        nullable=False,
        default="Medium",
        index=True
    )

    predicted_category = db.Column(
        db.String(100)
    )

    predicted_urgency = db.Column(
        db.String(50)
    )

    image_url = db.Column(
        db.Text
    )

    status = db.Column(
        db.Enum(
            "Open",
            "Assigned",
            "In Progress",
            "Resolved",
            "Rejected",
            name="complaint_status"
        ),
        nullable=False,
        default="Open",
        index=True
    )

    assigned_to = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    creator = db.relationship(
        "User",
        foreign_keys=[created_by],
        lazy="joined"
    )

    assignee = db.relationship(
        "User",
        foreign_keys=[assigned_to],
        lazy="joined"
    )

    is_deleted = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "urgency": self.urgency,
            "predicted_category": self.predicted_category,
            "predicted_urgency": self.predicted_urgency,
            "image_url": self.image_url,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat()
            if self.created_at else None,
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None,
        }

    def __repr__(self):
        return (
            f"<Complaint "
            f"id={self.id} "
            f"title='{self.title}' "
            f"status='{self.status}'>"
        )