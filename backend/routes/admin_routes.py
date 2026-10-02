from flask import Blueprint, jsonify, request

from flask_jwt_extended import jwt_required

from services.admin_service import AdminService

from middleware.auth_middleware import role_required



admin_bp = Blueprint(
    "admin",
    __name__
)



# ============================
# DASHBOARD
# ============================

@admin_bp.route(
    "/dashboard",
    methods=["GET"]
)
@jwt_required()
@role_required("admin")
def dashboard():

    data = AdminService.dashboard()


    return jsonify({

        "success": True,

        "data": data

    })





# ============================
# COMPLAINTS
# ============================


@admin_bp.route(
    "/complaints",
    methods=["GET"]
)
@jwt_required()
@role_required("admin")
def complaints():

    data = AdminService.get_complaints()


    return jsonify({

        "success": True,

        "data":[
            c.to_dict()
            for c in data
        ]

    })





# ============================
# COMPLAINT DETAILS
# ============================


@admin_bp.route(
    "/complaints/<int:id>",
    methods=["GET"]
)
@jwt_required()
@role_required("admin")
def details(id):


    complaint = AdminService.complaint_details(id)


    if not complaint:

        return jsonify({

            "success":False,

            "message":"Complaint not found"

        }),404



    return jsonify({

        "success":True,

        "data":complaint.to_dict()

    })







# ============================
# DELETE COMPLAINT
# ============================


@admin_bp.route(
    "/complaints/<int:id>",
    methods=["DELETE"]
)
@jwt_required()
@role_required("admin")
def delete_complaint(id):


    deleted = AdminService.delete_complaint(id)



    if not deleted:

        return jsonify({

            "success":False,

            "message":"Complaint not found"

        }),404




    return jsonify({

        "success":True,

        "message":"Complaint deleted successfully"

    }),200







# ============================
# ASSIGN STAFF
# ============================


@admin_bp.route(
    "/complaints/<int:id>/assign",
    methods=["PUT"]
)
@jwt_required()
@role_required("admin")
def assign(id):


    data = request.json


    complaint = AdminService.assign_staff(
        id,
        data.get("staff_id")
    )


    if not complaint:

        return jsonify({

            "success":False,

            "message":"Unable to assign staff"

        }),400



    return jsonify({

        "success":True,

        "data":complaint.to_dict()

    })





# ============================
# STAFF MANAGEMENT
# ============================

@admin_bp.route("/staff", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_staff():

    users = AdminService.get_staff()

    return jsonify({
        "success": True,
        "data": [u.to_dict() for u in users]
    }), 200


@admin_bp.route("/staff", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_staff():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    result = AdminService.create_staff(data)

    if not result["success"]:
        return jsonify(result), 400

    return jsonify(result), 201


@admin_bp.route("/staff/<int:id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_staff(id):

    data = request.get_json()

    staff = AdminService.update_staff(id, data)

    if not staff:
        return jsonify({
            "success": False,
            "message": "Staff member not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Staff updated successfully.",
        "data": staff.to_dict()
    }), 200


@admin_bp.route("/staff/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_staff(id):

    deleted = AdminService.delete_staff(id)

    if not deleted:
        return jsonify({
            "success": False,
            "message": "Staff member not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Staff deleted successfully."
    }), 200


@admin_bp.route("/staff/<int:id>/toggle", methods=["PUT"])
@jwt_required()
@role_required("admin")
def toggle_staff(id):

    staff = AdminService.toggle_staff(id)

    if not staff:
        return jsonify({
            "success": False,
            "message": "Staff member not found."
        }), 404

    return jsonify({
        "success": True,
        "data": staff.to_dict()
    }), 200



# ============================
# SYSTEM SETTINGS
# ============================

@admin_bp.route(
    "/settings",
    methods=["GET"]
)
@jwt_required()
@role_required("admin")
def get_settings():

    settings = AdminService.get_settings()

    return jsonify({
        "success": True,
        "data": settings
    }), 200



@admin_bp.route(
    "/settings",
    methods=["PUT"]
)
@jwt_required()
@role_required("admin")
def update_settings():

    data = request.get_json()

    settings = AdminService.update_settings(data)

    return jsonify({
        "success": True,
        "message": "Settings updated successfully.",
        "data": settings
    }), 200



# ============================
# CHANGE PASSWORD
# ============================

@admin_bp.route(
    "/change-password",
    methods=["PUT"]
)
@jwt_required()
@role_required("admin")
def change_password():

    data = request.get_json()

    result = AdminService.change_password(data)

    if not result["success"]:
        return jsonify(result),400


    return jsonify(result),200