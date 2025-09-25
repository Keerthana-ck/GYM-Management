# Copyright (c) 2025, Keerthana and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document


class Member(Document):
	def after_save(self):
		self.create_customer_against_member()

	def create_customer_against_member(self):
		"""Method to Create Customer Against Member """
		if frappe.db.exists("Customer", self.name):
			frappe.throw("{0} Already Exists".format(self.name))
		customer = frappe.new_doc("Customer")
		customer.customer_name = self.name
		customer.customer_type = "Individual"
		customer.gender = self.gender
		customer.save()
