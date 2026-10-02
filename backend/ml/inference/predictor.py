import logging
import os

import joblib

from ml.preprocessing.text_preprocessor import TextPreprocessor
from ml.utils.label_mapper import (
    get_department,
    get_resolution_time,
)

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

CATEGORY_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "category_model.pkl"
)

URGENCY_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "urgency_model.pkl"
)


def load_model(path):
    try:
        return joblib.load(path)
    except Exception as e:
        logger.exception(
            f"Unable to load model: {path}"
        )
        raise RuntimeError(
            f"Model loading failed: {path}"
        ) from e


category_model = load_model(
    CATEGORY_MODEL_PATH
)

urgency_model = load_model(
    URGENCY_MODEL_PATH
)


class ComplaintPredictor:

    @staticmethod
    def _confidence(model, text):

        try:

            if hasattr(model, "decision_function"):

                scores = model.decision_function(
                    [text]
                )

                return round(
                    float(abs(scores.max())),
                    2,
                )

            elif hasattr(model, "predict_proba"):

                scores = model.predict_proba(
                    [text]
                )

                return round(
                    float(scores.max()),
                    2,
                )

        except Exception as e:
            logger.exception(e)

        return None

    @staticmethod
    def predict(text):

        if not text or not text.strip():
            raise ValueError(
                "Complaint text is empty."
            )

        cleaned = TextPreprocessor.clean_text(
            text
        )

        category = category_model.predict(
            [cleaned]
        )[0]

        urgency = urgency_model.predict(
            [cleaned]
        )[0]

        return {
            "category": category,
            "urgency": urgency,
            "department": get_department(category),
            "resolutionTime": get_resolution_time(
                urgency
            ),
            "categoryConfidence":
                ComplaintPredictor._confidence(
                    category_model,
                    cleaned,
                ),
            "urgencyConfidence":
                ComplaintPredictor._confidence(
                    urgency_model,
                    cleaned,
                ),
        }