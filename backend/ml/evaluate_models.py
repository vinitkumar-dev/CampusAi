import os
import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

from preprocessing.text_preprocessor import (
    TextPreprocessor,
)


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "complaints.csv",
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
)

REPORT_DIR = os.path.join(
    BASE_DIR,
    "reports",
)

os.makedirs(
    REPORT_DIR,
    exist_ok=True,
)


def load_dataset():

    df = pd.read_csv(
        DATA_PATH
    )

    df = df.drop(['ComplaintID'],axis=1)

    df["Complaint"] = (
        df["Complaint"]
        .astype(str)
        .apply(
            TextPreprocessor.clean_text
        )
    )

    return df


def evaluate_category_model(df):

    model = joblib.load(
        os.path.join(
            MODEL_DIR,
            "category_model.pkl",
        )
    )

    X = df[
        "Complaint"
    ]

    y_true = df[
        "Category"
    ]

    y_pred = model.predict(X)

    accuracy = (
        accuracy_score(
            y_true,
            y_pred,
        )
    )

    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            y_true,
            y_pred,
            average="weighted",
        )
    )

    report = (
        classification_report(
            y_true,
            y_pred,
        )
    )

    matrix = (
        confusion_matrix(
            y_true,
            y_pred,
        )
    )

    with open(
        os.path.join(
            REPORT_DIR,
            "category_report.txt",
        ),
        "w",
        encoding="utf-8",
    ) as file:

        file.write(
            "CATEGORY MODEL REPORT\n\n"
        )

        file.write(
            f"Accuracy: {accuracy:.4f}\n"
        )

        file.write(
            f"Precision: {precision:.4f}\n"
        )

        file.write(
            f"Recall: {recall:.4f}\n"
        )

        file.write(
            f"F1 Score: {f1:.4f}\n\n"
        )

        file.write(
            report
        )

        file.write(
            "\n\nConfusion Matrix\n\n"
        )

        file.write(
            str(matrix)
        )

    return accuracy


def evaluate_urgency_model(df):

    model = joblib.load(
        os.path.join(
            MODEL_DIR,
            "urgency_model.pkl",
        )
    )

    X = df[
        "Complaint"
    ]

    y_true = df[
        "Urgency"
    ]

    y_pred = model.predict(X)

    accuracy = (
        accuracy_score(
            y_true,
            y_pred,
        )
    )

    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            y_true,
            y_pred,
            average="weighted",
        )
    )

    report = (
        classification_report(
            y_true,
            y_pred,
        )
    )

    matrix = (
        confusion_matrix(
            y_true,
            y_pred,
        )
    )

    with open(
        os.path.join(
            REPORT_DIR,
            "urgency_report.txt",
        ),
        "w",
        encoding="utf-8",
    ) as file:

        file.write(
            "URGENCY MODEL REPORT\n\n"
        )

        file.write(
            f"Accuracy: {accuracy:.4f}\n"
        )

        file.write(
            f"Precision: {precision:.4f}\n"
        )

        file.write(
            f"Recall: {recall:.4f}\n"
        )

        file.write(
            f"F1 Score: {f1:.4f}\n\n"
        )

        file.write(
            report
        )

        file.write(
            "\n\nConfusion Matrix\n\n"
        )

        file.write(
            str(matrix)
        )

    return accuracy


def main():

    df = load_dataset()

    category_accuracy = (
        evaluate_category_model(
            df
        )
    )

    urgency_accuracy = (
        evaluate_urgency_model(
            df
        )
    )

    print(
        "\nMODEL EVALUATION COMPLETED"
    )

    print(
        "\nCategory Accuracy:",
        round(
            category_accuracy,
            4,
        ),
    )

    print(
        "Urgency Accuracy:",
        round(
            urgency_accuracy,
            4,
        ),
    )

    print(
        "\nReports Saved To:"
    )

    print(
        "reports/category_report.txt"
    )

    print(
        "reports/urgency_report.txt"
    )


if __name__ == "__main__":
    main()