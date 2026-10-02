from database.db import db
from datetime import datetime


class SystemSettings(db.Model):

    __tablename__ = "system_settings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    ai_enabled = db.Column(
        db.Boolean,
        default=True
    )

    notification_enabled = db.Column(
        db.Boolean,
        default=True
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    def to_dict(self):

        return {
            "id": self.id,
            "aiEnabled": self.ai_enabled,
            "notification": self.notification_enabled,
            "updated_at": self.updated_at
        }