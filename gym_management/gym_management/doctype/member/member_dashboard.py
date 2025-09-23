def get_data():
    return {
        "fieldname": "member",
        "non_standard_fieldnames": {
            "Customer": "customer_name"
        },
        "transactions": [
            {
                "label": "Customer",
                "items": ["Customer"]
            },
        ],
    }
