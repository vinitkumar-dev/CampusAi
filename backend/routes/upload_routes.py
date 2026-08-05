import os

from flask import (
    Blueprint,
    jsonify,
    request,
    current_app,
    send_from_directory,
)

from flask_jwt_extended import (
    jwt_required,
)

from services.file_upload_service import (
    FileUploadService,
)


upload_bp = Blueprint(
    "upload",
    __name__,
)

@upload_bp.route(
    "",
    methods=["POST"],
)
@jwt_required()
def upload_file():

    try:

        if (
            "file"
            not in request.files
        ):

            return jsonify(
                {
                    "status":
                    "error",

                    "message":
                    "No file uploaded",
                }
            ), 400

        file = request.files[
            "file"
        ]

        result = (
            FileUploadService
            .save_file(
                file,
                current_app.config[
                    "UPLOAD_FOLDER"
                ],
            )
        )

        return jsonify(
            {
                "status":
                "success",

                "data":
                result,
            }
        ), 201

    except Exception as e:

        return jsonify(
            {
                "status":
                "error",

                "message":
                str(e),
            }
        ), 500
    

@upload_bp.route(
    "/<filename>",
    methods=["GET"],
)
def get_uploaded_file(
    filename,
):

    try:
            return (
            send_from_directory(
                current_app.config[
                    "UPLOAD_FOLDER"
                ],
                filename,
            )
        )


    except Exception as e:
        import traceback

        traceback.print_exc()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500