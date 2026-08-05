import random
import pandas as pd


CATEGORIES = {
    "Internet": [
        "wifi not working",
        "internet speed is very slow",
        "network disconnected",
        "unable to access campus wifi",
        "internet outage in hostel",
    ],

    "Hostel": [
        "fan not working",
        "room lock broken",
        "hostel room cleaning issue",
        "water leakage in hostel",
        "bed damaged",
    ],

    "Library": [
        "library computer not working",
        "books not available",
        "reading room lights off",
        "library wifi issue",
        "library closed unexpectedly",
    ],

    "Electricity": [
        "power outage",
        "light not working",
        "electrical socket damaged",
        "frequent power cuts",
        "classroom electricity failure",
    ],

    "Transport": [
        "college bus delayed",
        "bus not arriving",
        "transport timing issue",
        "driver absent",
        "bus breakdown",
    ],

    "Laboratory": [
        "lab equipment damaged",
        "computer not working in lab",
        "lab software issue",
        "network problem in lab",
        "projector not working",
    ],

    "Plumbing": [
        "water leakage",
        "tap not working",
        "washroom drainage issue",
        "pipe damaged",
        "water supply interrupted",
    ],

    "Mess": [
        "food quality poor",
        "mess hygiene issue",
        "food served cold",
        "mess water problem",
        "insufficient food quantity",
    ],

    "Sports": [
        "sports equipment damaged",
        "ground maintenance issue",
        "gym machine broken",
        "sports room locked",
        "court lighting issue",
    ],

    "Academic": [
        "classroom projector issue",
        "faculty attendance concern",
        "timetable conflict",
        "classroom cleanliness issue",
        "assignment portal not working",
    ],

    "Medical": [
        "medical room closed",
        "doctor unavailable",
        "first aid kit empty",
        "health emergency support issue",
        "ambulance delay",
    ],

    "Security": [
        "unauthorized entry detected",
        "security guard absent",
        "hostel gate issue",
        "suspicious activity reported",
        "campus safety concern",
    ],
}


URGENCY_MAPPING = {
    "Low": [
        "whenever possible",
        "not urgent",
        "can be fixed later",
    ],

    "Medium": [
        "needs attention",
        "affecting students",
        "please resolve soon",
    ],

    "High": [
        "serious issue",
        "many students affected",
        "urgent resolution needed",
    ],

    "Critical": [
        "emergency",
        "safety risk",
        "immediate action required",
    ],
}


SAMPLES_PER_CATEGORY = 450

dataset = []


for category, complaints in (
    CATEGORIES.items()
):

    for _ in range(
        SAMPLES_PER_CATEGORY
    ):

        complaint = random.choice(
            complaints
        )

        urgency = random.choice(
            list(
                URGENCY_MAPPING.keys()
            )
        )

        urgency_phrase = (
            random.choice(
                URGENCY_MAPPING[
                    urgency
                ]
            )
        )

        final_text = (
            f"{complaint}. "
            f"{urgency_phrase}."
        )

        dataset.append(
            {
                "complaint_text":
                final_text,

                "category":
                category,

                "urgency":
                urgency,
            }
        )


df = pd.DataFrame(
    dataset
)

df = df.sample(
    frac=1,
    random_state=42
).reset_index(
    drop=True
)

df.to_csv(
    "complaints.csv",
    index=False
)

print(
    f"Dataset Generated Successfully!"
)

print(
    f"Total Samples: {len(df)}"
)

print(
    "\nCategory Distribution:"
)

print(
    df["category"]
    .value_counts()
)

print(
    "\nUrgency Distribution:"
)

print(
    df["urgency"]
    .value_counts()
)