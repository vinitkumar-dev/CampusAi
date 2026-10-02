import os
import sys
import logging
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report

# ----------------------------------------------------
# Logging
# ----------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# ----------------------------------------------------
# Add ML directory to path
# ----------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(CURRENT_DIR)

if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from preprocessing.text_preprocessor import TextPreprocessor

# ----------------------------------------------------
# Paths
# ----------------------------------------------------
DATA_PATH = os.path.join(
    ML_DIR,
    "data",
    "complaints.csv",
)

MODEL_DIR = os.path.join(
    ML_DIR,
    "models",
)

REPORT_DIR = os.path.join(
    ML_DIR,
    "reports",
)

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)


# ----------------------------------------------------
# Load Dataset
# ----------------------------------------------------
def load_data():

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset not found:\n{DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    df = df.drop(
        columns=["ComplaintID"],
        errors="ignore",
    )

    df = df.dropna(
        subset=[
            "Complaint",
            "Category",
        ]
    )

    df["Complaint"] = (
        df["Complaint"]
        .astype(str)
        .apply(TextPreprocessor.clean_text)
    )

    logger.info(
        f"Loaded {len(df)} complaints."
    )

    return df


# ----------------------------------------------------
# Build Pipeline
# ----------------------------------------------------
def build_pipeline():

    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
            ),
        ),
        (
            "classifier",
            LinearSVC(
                random_state=42
            ),
        ),
    ])


# ----------------------------------------------------
# Train Model
# ----------------------------------------------------
def train():

    logger.info("Loading dataset...")

    df = load_data()

    X = df["Complaint"]
    y = df["Category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()

    logger.info("Training category model...")

    pipeline.fit(
        X_train,
        y_train,
    )

    y_pred = pipeline.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        y_pred,
    )

    report = classification_report(
        y_test,
        y_pred,
    )

    logger.info(
        f"Accuracy : {accuracy:.4f}"
    )

    print("\n")
    print("=" * 60)
    print("CATEGORY MODEL REPORT")
    print("=" * 60)
    print(report)

    # --------------------------
    # Save Model
    # --------------------------

    model_path = os.path.join(
        MODEL_DIR,
        "category_model.pkl",
    )

    joblib.dump(
        pipeline,
        model_path,
    )

    logger.info(
        f"Model saved to {model_path}"
    )

    # --------------------------
    # Save Report
    # --------------------------

    report_path = os.path.join(
        REPORT_DIR,
        "category_report.txt",
    )

    with open(
        report_path,
        "w",
        encoding="utf-8",
    ) as f:

        f.write(
            "CATEGORY MODEL REPORT\n"
        )

        f.write("=" * 60)

        f.write("\n\n")

        f.write(
            f"Accuracy : {accuracy:.4f}\n\n"
        )

        f.write(report)

    logger.info(
        f"Report saved to {report_path}"
    )

    # --------------------------
    # Save Metadata
    # --------------------------

    metadata = {
        "accuracy": round(
            accuracy,
            4,
        ),
        "samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "max_features": 5000,
        "ngram": "(1,2)",
        "algorithm": "LinearSVC",
    }

    metadata_path = os.path.join(
        MODEL_DIR,
        "category_metadata.pkl",
    )

    joblib.dump(
        metadata,
        metadata_path,
    )

    logger.info(
        "Metadata saved successfully."
    )

    logger.info(
        "Category model training completed."
    )


# ----------------------------------------------------
# Main
# ----------------------------------------------------
if __name__ == "__main__":

    try:

        train()

    except Exception as e:

        logger.exception(
            "Training failed."
        )

        print(e)