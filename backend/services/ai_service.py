import logging

from models.complaint_model import Complaint

from ml.inference.predictor import ComplaintPredictor
from ml.inference.duplicate_detector import DuplicateDetector

logger = logging.getLogger(__name__)


class AIService:

    @staticmethod
    def analyze_complaint(complaint_text):

        if not complaint_text or not complaint_text.strip():
            raise ValueError(
                "Complaint text cannot be empty."
            )

        # ----------------------------------
        # Prediction
        # ----------------------------------

        try:

            prediction = ComplaintPredictor.predict(
                complaint_text
            )

        except Exception as e:

            logger.exception(e)

            prediction = {
                "category": "General",
                "urgency": "Medium",
                "department": "General",
                "resolutionTime": "3-5 Days",
                "categoryConfidence": 0,
                "urgencyConfidence": 0,
            }

        # ----------------------------------
        # Existing Complaints
        # ----------------------------------

        complaints = Complaint.query.filter(
            Complaint.status != "Resolved"
        ).all()

        complaint_records = [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "status": c.status,
                "category": c.category,
            }
            for c in complaints
        ]

        # ----------------------------------
        # Duplicate Detection
        # ----------------------------------

        try:

            duplicate_result = DuplicateDetector.detect(
                complaint_text,
                complaint_records,
            )

        except Exception as e:

            logger.exception(e)

            duplicate_result = {
                "isDuplicate": False,
                "similarity": 0,
                "matchedComplaint": None,
            }

        # ----------------------------------
        # Final Response
        # ----------------------------------

        return {
            "category": prediction.get("category"),
            "urgency": prediction.get("urgency"),
            "department": prediction.get("department"),
            "resolutionTime": prediction.get("resolutionTime"),
            "categoryConfidence": prediction.get("categoryConfidence"),
            "urgencyConfidence": prediction.get("urgencyConfidence"),
            "isDuplicate": duplicate_result.get("isDuplicate"),
            "duplicateSimilarity": duplicate_result.get("similarity"),
            "matchedComplaint": duplicate_result.get("matchedComplaint"),
        }