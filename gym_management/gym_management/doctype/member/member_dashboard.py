def get_data():
    return {
        "fieldname": "member",
        "non_standard_fieldnames": {
            "Customer": "customer_name",
            "Membership Register": "member"
        },
        "transactions": [
            {
                "label": "Linked Records",
                "items": ["Customer", "Membership Register"]
            }
        ]
    }
