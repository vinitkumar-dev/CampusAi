CATEGORY_TO_DEPARTMENT = {
    "Internet": "IT Support Team",

    "Hostel": "Hostel Administration",

    "Library": "Library Management",

    "Electricity": "Electrical Maintenance Team",

    "Transport": "Transport Department",

    "Laboratory": "Lab Management Team",

    "Plumbing": "Maintenance Department",

    "Mess": "Mess Management",

    "Sports": "Sports Department",

    "Academic": "Academic Affairs",

    "Medical": "Campus Health Center",

    "Security": "Campus Security Office",
}


PRIORITY_SLA = {
    "Low": {
        "resolution_time": "5-7 Days"
    },

    "Medium": {
        "resolution_time": "2-4 Days"
    },

    "High": {
        "resolution_time": "24 Hours"
    },

    "Critical": {
        "resolution_time": "Immediate"
    },
}


def get_department(category):
    return CATEGORY_TO_DEPARTMENT.get(
        category,
        "General Administration"
    )


def get_resolution_time(
    urgency
):
    return PRIORITY_SLA.get(
        urgency,
        {
            "resolution_time":
            "Not Available"
        }
    )["resolution_time"]