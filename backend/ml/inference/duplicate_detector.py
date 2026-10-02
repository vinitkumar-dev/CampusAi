import logging
import os

import joblib
import numpy as np

from sklearn.metrics.pairwise import cosine_similarity

from ml.preprocessing.text_preprocessor import TextPreprocessor

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


def load_vectorizer():
    try:
        pipeline = joblib.load(
            CATEGORY_MODEL_PATH
        )

        if "tfidf" not in pipeline.named_steps:
            raise RuntimeError(
                "TF-IDF step not found."
            )

        return pipeline.named_steps["tfidf"]

    except Exception as e:
        logger.exception(e)
        raise


vectorizer = load_vectorizer()


class DuplicateDetector:

    SIMILARITY_THRESHOLD = 0.80

    @staticmethod
    def detect(
        new_complaint,
        existing_complaints,
    ):

        if not new_complaint or not str(new_complaint).strip():
            return {
                "isDuplicate": False,
                "similarity": 0,
                "matchedComplaint": None,
            }

        if not existing_complaints:
            return {
                "isDuplicate": False,
                "similarity": 0,
                "matchedComplaint": None,
            }

        try:

            cleaned_new = TextPreprocessor.clean_text(
                new_complaint
            )

            complaint_texts = [
                TextPreprocessor.clean_text(
                    f"{c.get('title', '')} {c.get('description', '')}"
                )
                for c in existing_complaints
            ]

            all_texts = [
                cleaned_new,
                *complaint_texts,
            ]

            tfidf_matrix = vectorizer.transform(
                all_texts
            )

            similarities = cosine_similarity(
                tfidf_matrix[0],
                tfidf_matrix[1:],
            )[0]

            if len(similarities) == 0:
                return {
                    "isDuplicate": False,
                    "similarity": 0,
                    "matchedComplaint": None,
                }

            best_index = int(
                np.argmax(similarities)
            )

            best_score = float(
                similarities[best_index]
            )

            return {
                "isDuplicate":
                    best_score >= DuplicateDetector.SIMILARITY_THRESHOLD,
                "similarity":
                    round(best_score * 100, 2),
                "matchedComplaint":
                    existing_complaints[best_index]
                    if best_score >= DuplicateDetector.SIMILARITY_THRESHOLD
                    else None,
            }

        except Exception as e:

            logger.exception(e)

            return {
                "isDuplicate": False,
                "similarity": 0,
                "matchedComplaint": None,
            }