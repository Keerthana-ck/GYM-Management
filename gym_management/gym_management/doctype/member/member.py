# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document


class Member(Document):
    def validate(self):
        self.create_customer_against_member()

    def create_customer_against_member(self):
        """Method to Create Customer Against Member"""
        if frappe.db.exists("Customer", {"customer_name": self.name}):
            return

        customer = frappe.new_doc("Customer")
        customer.customer_name = self.name
        customer.customer_type = "Individual"
        customer.gender = self.gender
        customer.insert(ignore_permissions=True)
        frappe.msgprint(f"Customer {customer.name} created for Member {self.name}")
