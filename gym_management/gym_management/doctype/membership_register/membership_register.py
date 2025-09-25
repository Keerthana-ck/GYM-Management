# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class MembershipRegister(Document):
	def validate(self):
		self.validate_membership()

	def validate_membership(self):
	    """Validate the Membership if the member between the same date range"""
	    overlapping = frappe.db.get_list(
	        "Membership Register",
	        filters={
	            "member": self.member,
	            "start_date": ["<=", self.end_date],
	            "end_date": [">=", self.start_date],
	            "name": ["!=", self.name]
	        },
	        fields=["name"]
	    )
	    if overlapping:
	        frappe.throw("This member already has a membership within the selected date range.")
