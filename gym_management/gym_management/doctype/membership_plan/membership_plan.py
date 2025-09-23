# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt
import frappe
from datetime import date
from frappe.model.document import Document


class MembershipPlan(Document):

	def autoname(self):
	    """Generate plan id automatically"""
	    if self.membership and self.type:
	        self.name = f"{self.membership}-{self.type}"
	    else:
	        frappe.throw("Plan and Type are required to generate Plan ID")

	def validate(self):
	    self.validate_membership_plan()
	    self.create_service_item()
		
	def create_service_item(self):
	    """Create service item against membership plan"""
	    if frappe.db.exists("Item", self.name):
	        frappe.throw("Item {0} Already Exists".format(self.name))
	    item = frappe.new_doc("Item")
	    item.item_code = self.name
	    item.item_name = self.name
	    item.item_group = "Services"
	    item.valuation_rate = self.amount
	    item.is_stock_item = False
	    item.save()

	def validate_membership_plan(self):
	    """Validate Membership Plan to avoid duplicate entry excluding current document"""
	    duplicate = frappe.db.exists(
	        "Membership Plan",
	        {
	            "membership": self.membership,
	            "type": self.type,
	            "name": ["!=", self.name]
	        }
	    )
	    if duplicate:
	        frappe.throw(f"Membership Plan with membership '{self.membership}' and type '{self.type}' already exists.")
