import frappe

@frappe.whitelist()
def change_membership_status(doc, method=None):
    """When Sales Invoice is submitted, activate Membership and Member"""
    if doc.docstatus != 1:
        return

    if doc.custom_reference_id :
         if frappe.db.exists("Membership Register", doc.custom_reference_id):
             membership_status = frappe.db.get_value("Membership Register", doc.custom_reference_id, "membership_status")
             if membership_status != "Active":
                 frappe.db.set_value("Membership Register", doc.custom_reference_id, "membership_status", "Active")
                 membership = frappe.get_doc("Membership Register", doc.custom_reference_id)
                 subject = "Membership is Activated"
                 message = f"""
                    <p>Dear {membership.member},</p>
                    <p>Your Membership <b>{membership.name}</b> is Activated. Membership Id is <b>{membership.name}</b>.</p>
                    <p>Thank you,<br>Team</p>
                 """
                 frappe.sendmail(
                    recipients=[membership.email],
                    subject=subject,
                    message=message,
                    reference_doctype=membership.doctype,
                    reference_name=membership.name
                 )

    if doc.customer:
        if frappe.db.exists("Member", doc.customer):
            member_status = frappe.db.get_value("Member", doc.customer, "status")
            if member_status == "Pending":
                frappe.db.set_value("Member", doc.customer, "status", "Active")
