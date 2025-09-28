// Copyright (c) 2025, Keerthana and contributors
// For license information, please see license.txt

frappe.ui.form.on('Member', {
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
    },
    refresh(frm){
      if(frm.doc.status == "Pending" && !(frm.is_new())){
        frm.add_custom_button(('Registration'), function() {
          frappe.new_doc('Membership Register', {
            member : frm.doc.member_name,
            phone_number : frm.doc.mobile_number,
            gender : frm.doc.gender,
            email : frm.doc.email,
            age : frm.doc.age
          });
        }, ('Create'));
      }
    }
});
