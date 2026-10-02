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
    def _predict_with_confidence(model, cleaned_text):
        """
        Returns (label, confidence).

        confidence is the model's predict_proba() probability of the
        PREDICTED class, as a float in [0, 1].  If the loaded model has no
        predict_proba (e.g. an old un-calibrated LinearSVC pickle), the
        confidence is None -- it is never invented.  Raw SVM margins are
        NOT probabilities and are deliberately not used.
        """

        label = model.predict([cleaned_text])[0]

        if not hasattr(model, "predict_proba"):
            return label, None

        try:
            probabilities = model.predict_proba([cleaned_text])[0]
            classes = list(model.classes_)

            # Probability of the class that was actually predicted
            confidence = float(probabilities[classes.index(label)])

            if confidence != confidence:  # NaN guard
                return label, None

            return label, round(min(max(confidence, 0.0), 1.0), 4)

        except Exception:
            logger.exception("Unable to compute prediction confidence")
            return label, None

    @staticmethod
    def predict(text):

        if not text or not text.strip():
            raise ValueError(
                "Complaint text is empty."
            )

        cleaned = TextPreprocessor.clean_text(
            text
        )

        category, category_confidence = (
            ComplaintPredictor._predict_with_confidence(
                category_model,
                cleaned,
            )
        )

        urgency, urgency_confidence = (
            ComplaintPredictor._predict_with_confidence(
                urgency_model,
                cleaned,
            )
        )

        return {
            "category": category,
            "urgency": urgency,
            "department": get_department(category),
            "resolutionTime": get_resolution_time(urgency),
            "categoryConfidence": category_confidence,
            "urgencyConfidence": urgency_confidence,
        }
