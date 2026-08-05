from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from middleware.auth_middleware import role_required

from services.staff_service import StaffService


staff_bp = Blueprint(
    "staff",
    __name__,
    url_prefix="/api/staff",
)



def complaint_to_dict(c):

    return {

        "id": c.id,

        "title": c.title,

        "description": c.description,

        "category": c.category,

        "urgency": c.urgency,

        "status": c.status,

        "image_url": c.image_url,

        "created_at": (
            c.created_at.isoformat()
            if c.created_at
            else None
        ),

        "updated_at": (
            c.updated_at.isoformat()
            if c.updated_at
            else None
        ),

    }




# ==========================================
# Dashboard
# ==========================================

@staff_bp.route(
    "/dashboard",
    methods=["GET"],
)
@jwt_required()
@role_required("staff")
def dashboard():

    staff_id = get_jwt_identity()

    data = StaffService.get_dashboard(staff_id)


    def serialize(obj):

        if isinstance(obj, list):

            return [
                serialize(item)
                for item in obj
            ]


        if hasattr(obj, "__dict__"):

            return {

                "id": obj.id,

                "title": obj.title,

                "description": obj.description,

                "category": obj.category,

                "urgency": obj.urgency,

                "status": obj.status,

                "image_url": obj.image_url,

                "created_at":
                    obj.created_at.isoformat()
                    if obj.created_at
                    else None,

                "updated_at":
                    obj.updated_at.isoformat()
                    if obj.updated_at
                    else None,

            }


        if isinstance(obj, dict):

            return {
                key: serialize(value)
                for key, value in obj.items()
            }


        return obj



    data = serialize(data)


    return jsonify({

        "success": True,

        "data": data

    }), 200





# ==========================================
# Assigned Complaints
# ==========================================

@staff_bp.route(
    "/complaints",
    methods=["GET"],
)
@jwt_required()
@role_required("staff")
def assigned_complaints():


    staff_id = get_jwt_identity()


    complaints = StaffService.get_assigned_complaints(
        staff_id
    )


    data = [

        complaint_to_dict(c)

        for c in complaints

    ]


    return jsonify({

        "success": True,

        "data": data

    }), 200





# ==========================================
# Complaint Details
# ==========================================

@staff_bp.route(
    "/complaints/<int:complaint_id>",
    methods=["GET"],
)
@jwt_required()
@role_required("staff")
def complaint_details(
    complaint_id
):


    staff_id = get_jwt_identity()


    complaint = StaffService.get_complaint(
        staff_id,
        complaint_id,
    )


    if complaint is None:

        return jsonify({

            "success": False,

            "message": "Complaint not found."

        }), 404



    return jsonify({

        "success": True,

        "data": complaint_to_dict(
            complaint
        )

    }), 200





# ==========================================
# Update Complaint Status
# ==========================================

@staff_bp.route(
    "/complaints/<int:complaint_id>",
    methods=["PUT"],
)
@jwt_required()
@role_required("staff")
def update_complaint(
    complaint_id
):


    staff_id = get_jwt_identity()


    complaint = StaffService.update_status(

        staff_id,

        complaint_id,

        request.json

    )



    if complaint is None:

        return jsonify({

            "success": False,

            "message": "Complaint not found."

        }),404




    return jsonify({

        "success": True,

        "message": "Complaint updated successfully.",

        "data": complaint_to_dict(
            complaint
        )

    }),200





# ==========================================
# Analytics
# ==========================================

@staff_bp.route(
    "/analytics",
    methods=["GET"],
)
@jwt_required()
@role_required("staff")
def analytics():


    staff_id = get_jwt_identity()


    data = StaffService.analytics(
        staff_id
    )


    return jsonify({

        "success": True,

        "data": data

    }),200