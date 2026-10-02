from inference.predictor import (
    ComplaintPredictor,
)


def test_cases():

    complaints = [

        "WiFi is not working in hostel block A since yesterday",

        "The mess food quality is very poor and many students are sick",

        "Water leakage in hostel bathroom needs urgent repair",

        "Library computers are not functioning properly",

        "Unauthorized person entered the hostel at night",

        "Projector is not working in classroom 302",

        "College bus is arriving late every day",

        "Power outage in laboratory building",

        "Gym equipment is damaged",

        "Medical room is closed during working hours",
    ]

    print(
        "\nTesting AI Complaint System\n"
    )

    print(
        "=" * 80
    )

    for idx, complaint in enumerate(
        complaints,
        start=1,
    ):

        result = (
            ComplaintPredictor.predict(
                complaint
            )
        )

        print(
            f"\nTest Case {idx}"
        )

        print(
            "-" * 80
        )

        print(
            f"Complaint: {complaint}"
        )

        print(
            f"Category: {result['category']}"
        )

        print(
            f"Urgency: {result['urgency']}"
        )

        print(
            f"Department: {result['department']}"
        )

        print(
            f"Resolution Time: "
            f"{result['resolutionTime']}"
        )

        print(
            f"Category Confidence: "
            f"{result['categoryConfidence']}"
        )

        print(
            f"Urgency Confidence: "
            f"{result['urgencyConfidence']}"
        )

    print(
        "\nTesting Completed"
    )


if __name__ == "__main__":
    test_cases()