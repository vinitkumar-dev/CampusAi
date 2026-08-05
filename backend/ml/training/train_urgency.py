import os
import sys
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score,
    classification_report,
)

# ----------------------------------------------------
# Add ml folder to Python path
# ----------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(CURRENT_DIR)

if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from preprocessing.text_preprocessor import TextPreprocessor

# ----------------------------------------------------
# Paths
# ----------------------------------------------------
BASE_DIR = ML_DIR

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "complaints.csv",
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True,
)


def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.drop(['ComplaintID'],axis=1)

    df = df.dropna(
        subset=[
            "Complaint",
            "Urgency",
        ]
    )

    df["Complaint"] = (
        df["Complaint"]
        .astype(str)
        .apply(TextPreprocessor.clean_text)
    )

    return df


def train():
    df = load_data()

    X = df["Complaint"]
    y = df["Urgency"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=5000,
                    ngram_range=(1, 2),
                ),
            ),
            (
                "classifier",
                LinearSVC(),
            ),
        ]
    )

    pipeline.fit(
        X_train,
        y_train,
    )

    predictions = pipeline.predict(
        X_test,
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print(f"\nUrgency Accuracy: {accuracy:.4f}")

    print("\nClassification Report:\n")

    print(
        classification_report(
            y_test,
            predictions,
        )
    )

    model_path = os.path.join(
        MODEL_DIR,
        "urgency_model.pkl",
    )

    joblib.dump(
        pipeline,
        model_path,
    )

    print(f"\nModel saved to: {model_path}")


if __name__ == "__main__":
    train()