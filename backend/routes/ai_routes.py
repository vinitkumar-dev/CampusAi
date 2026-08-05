from flask import (
    Blueprint,
    jsonify,
    request,
)

from ml.inference.predictor import (
    ComplaintPredictor,
)

from services.ai_service import (
    AIService
)

ai_bp = Blueprint(
    "ai",
    __name__,
)


@ai_bp.route(
    "/analyze",
    methods=["POST"],
)
def analyze_complaint():

    try:

        data = request.get_json()

        if not data:
            return (
                jsonify(
                    {
                        "status":
                        "error",
                        "message":
                        "Request body is required",
                    }
                ),
                400,
            )

        complaint_text = data.get(
            "complaint",
            "",
        ).strip()

        if not complaint_text:

            return (
                jsonify(
                    {
                        "status":
                        "error",
                        "message":
                        "Complaint text is required",
                    }
                ),
                400,
            )

        prediction = (
            AIService.analyze_complaint(
                complaint_text
            )
        )

        response = {
            "status":
            "success",

            "complaint":
            complaint_text,

            "category":
            prediction[
                "category"
            ],

            "urgency":
            prediction[
                "urgency"
            ],

            "department":
            prediction[
                "department"
            ],

            "resolutionTime":
            prediction[
                "resolutionTime"
            ],

            "categoryConfidence":
            prediction[
                "categoryConfidence"
            ],

            "urgencyConfidence":
            prediction[
                "urgencyConfidence"
            ],
        }

        return (
            jsonify(response),
            200,
        )

    except Exception as e:

        return (
            jsonify(
                {
                    "status":
                    "error",

                    "message":
                    str(e),
                }
            ),
            500,
        )