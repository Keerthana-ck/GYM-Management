def get_data():
    return {
        "fieldname": "membership",
        "non_standard_fieldnames": {
            "Item": "item_name"
        },
        # "dynamic_links": {"lead_name": ["Lead", "quotation_to"]},
        "transactions": [
            {
                "label": "Item",
                "items": ["Item"]
            },
        ],
    }
