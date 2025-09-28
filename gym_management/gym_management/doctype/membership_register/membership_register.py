# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today


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


def change_status_expired():
    """Daily job: Change status to Expired if end_date is over"""
    expired_memberships = frappe.get_all(
        "Membership Register",
        filters={"end_date": ("<", frappe.utils.today()), "membership_status": ["!=", "Expired"]},
        fields=["name", "member"]
    )

    for membership in expired_memberships:
        frappe.db.set_value("Membership Register", membership.name, "membership_status", "Expired")
        subject = "Membership is Expired"
        message = f"""
	        <p>Dear {membership.member},</p>
	        <p>Your Membership <b>{membership.name}</b> is Expired. Please Renew the Membership <b>{membership.name}</b>.</p>
	        <p>Thank you,<br>Team</p>
        """

        frappe.sendmail(
	        recipients=[membership.email],
	        subject=subject,
	        message=message,
	        reference_doctype=membership.doctype,
	        reference_name=membership.name
	    )

        if membership.member:
            if frappe.db.exists("Member", membership.member):
                current_status = frappe.db.get_value("Member", membership.member, "status")
                if current_status != "Expired":
                    frappe.db.set_value("Member", membership.member, "status", "Expired")

    frappe.db.commit()
