from database.db import db
from models.user_model import User


class ProfileService:

    # ----------------------------
    # Get Logged-in User Profile
    # ----------------------------

    @staticmethod
    def get_profile(user_id):

        user = User.query.get(user_id)

        if not user:
            return None

        return user.to_dict()

    # ----------------------------
    # Update Profile
    # ----------------------------

    @staticmethod
    def update_profile(user_id, data):

        user = User.query.get(user_id)

        if not user:
            return None

        # Editable Fields

        if "name" in data:
            user.name = data["name"].strip()

        if "phone" in data:
            user.phone = data["phone"].strip()

        if "department" in data:
            user.department = data["department"].strip()

        if "roll_number" in data:
            user.roll_number = data["roll_number"].strip()

        if "hostel" in data:
            user.hostel = data["hostel"].strip()

        if "bio" in data:
            user.bio = data["bio"].strip()

        if "profile_image" in data:
            user.profile_image = data["profile_image"]

        db.session.commit()

        return user.to_dict()