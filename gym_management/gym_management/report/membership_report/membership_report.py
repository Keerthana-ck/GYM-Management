# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt
import frappe

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    return [
        {"label": "ID", "fieldname": "name", "fieldtype": "Link", "options": "Membership Register", "width": 150},
        {"label": "Member", "fieldname": "member", "fieldtype": "Link", "options": "Member", "width": 150},
        {"label": "Phone Number", "fieldname": "phone_number", "fieldtype": "Data", "width": 150},
        {"label": "Trainer", "fieldname": "trainer", "fieldtype": "Link", "options": "Trainer", "width": 150},
        {"label": "Membership Plan", "fieldname": "membership_plan", "fieldtype": "Link", "options": "Membership Plan", "width": 150},
        {"label": "Plan", "fieldname": "plan", "fieldtype": "Data", "width": 150},
        {"label": "Membership Status", "fieldname": "membership_status", "fieldtype": "Data", "width": 150},
        {"label": "Start Date", "fieldname": "start_date", "fieldtype": "Date", "width": 120},
        {"label": "End Date", "fieldname": "end_date", "fieldtype": "Date", "width": 120},
        {"label": "Duration Days", "fieldname": "durationdays", "fieldtype": "Int", "width": 120},
        {"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Currency", "width": 150},
    ]


def get_data(filters):
    conditions = []
    values = {}

    if filters.get("from_date"):
        conditions.append("start_date >= %(from_date)s")
        values["from_date"] = filters["from_date"]

    if filters.get("to_date"):
        conditions.append("end_date <= %(to_date)s")
        values["to_date"] = filters["to_date"]

    if filters.get("status"):
        conditions.append("membership_status = %(status)s")
        values["status"] = filters["status"]

    condition_sql = " AND ".join(conditions)
    if condition_sql:
        condition_sql = "WHERE " + condition_sql

    query = f"""
        SELECT
            name,
            member,
            phone_number,
            trainer,
            membership_plan,
            plan,
            membership_status,
            start_date,
            end_date,
            durationdays,
            total_amount
        FROM `tabMembership Register`
        {condition_sql}
        ORDER BY start_date DESC
    """

    return frappe.db.sql(query, values, as_dict=True)
