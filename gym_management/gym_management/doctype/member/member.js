// Copyright (c) 2025, Keerthana and contributors
// For license information, please see license.txt

frappe.ui.form.on('Member', {
    setup(frm) {
      frm.set_query("address", function (doc) {
        return {
          filters: {
            link_doctype: "Member",
            link_name: doc.name,
          },
        };
      });
    },
    address(frm) {
      if (frm.doc.address) {
        frappe.call({
          method: "frappe.contacts.doctype.address.address.get_address_display",
          args: {
            address_dict: frm.doc.address,
          },
          callback: function (r) {
            let clean_address = r.message.replace(/<br\s*\/?>/gi, '\n');
            frm.set_value("primary_address", r.message);
          },
        });
      }
      if (!frm.doc.address) {
        frm.set_value("primary_address", "");
      }
    },
    dob(frm) {
        if (frm.doc.dob) {
            let dob = new Date(frm.doc.dob);
            let today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            let m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            frm.set_value('age', age);
        } else {
            frm.set_value('age', null);
        }
    }
});
