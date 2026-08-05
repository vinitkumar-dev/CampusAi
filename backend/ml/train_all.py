import subprocess
import sys


def run_script(script):

    print("\n" + "=" * 60)
    print(f"Running: {script}")
    print("=" * 60 + "\n")

    result = subprocess.run(
        [sys.executable, script]
    )

    if result.returncode != 0:
        raise Exception(f"Training failed: {script}")

    print(f"\nCompleted: {script}")


def main():

    try:

        print("\nStarting ML Training Pipeline...")

        run_script("training/train_category.py")

        run_script("training/train_urgency.py")

        print("\n" + "=" * 60)
        print("All Models Trained Successfully!")
        print("=" * 60)

        print("\nGenerated Files:")
        print("models/category_model.pkl")
        print("models/urgency_model.pkl")
        print("models/tfidf_vectorizer.pkl")

    except Exception as e:
        print(f"\nTraining Failed!\n{e}")


if __name__ == "__main__":
    main()