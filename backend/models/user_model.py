from werkzeug.security import generate_password_hash, check_password_hash
from database.db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.Enum(
            "student",
            "staff",
            "admin",
            name="user_roles"
        ),
        nullable=False,
        default="student"
    )

    is_active = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )
    phone = db.Column(
    db.String(20),
    nullable=True
    )

    department = db.Column(
        db.String(100),
        nullable=True
    )

    roll_number = db.Column(
        db.String(50),
        nullable=True
    )

    hostel = db.Column(
        db.String(100),
        nullable=True
    )

    profile_image = db.Column(
        db.Text,
        nullable=True
    )

    bio = db.Column(
        db.Text,
        nullable=True
    )
    # -------------------------
    # Password Helpers
    # -------------------------

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    # -------------------------
    # Serialize User
    # -------------------------

    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name,
        "email": self.email,
        "role": self.role,

        "phone": self.phone,
        "department": self.department,
        "roll_number": self.roll_number,
        "hostel": self.hostel,
        "profile_image": self.profile_image,
        "bio": self.bio,

        "is_active": self.is_active,

        "created_at": (
            self.created_at.isoformat()
            if self.created_at
            else None
        ),

        "updated_at": (
            self.updated_at.isoformat()
            if self.updated_at
            else None
        ),
    }
    # -------------------------
    # Debugging
    # -------------------------

    def __repr__(self):
        return (
            f"<User "
            f"id={self.id} "
            f"email='{self.email}' "
            f"role='{self.role}'>"
        )