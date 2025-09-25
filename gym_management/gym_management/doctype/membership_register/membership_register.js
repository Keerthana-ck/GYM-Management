// Copyright (c) 2025, Keerthana and contributors
// For license information, please see license.txt
frappe.ui.form.on("Membership Register", {
    end_date(frm) {
        calculate_duration(frm);
    },
    start_date(frm) {
        calculate_duration(frm);
    },
    amount(frm){
      calculate_total_amount(frm);
    },
    register_fee(frm){
      if(frm.doc.amount && frm.doc.register_fee){
        frm.set_value("total_amount", frm.doc.amount + frm.doc.register_fee);
      }
      else{
        frm.set_value("total_amount", frm.doc.amount);
      }
    },
    plan(frm){
      if(frm.doc.amount){
        frm.set_value("total_amount", frm.doc.amount);
      }
    },
    refresh(frm){
      if(!frm.is_new()){
        frm.add_custom_button(('Sales Invoice'), function() {

        }, ('Create'));

      }
    }
});

function calculate_duration(frm) {
    if (frm.doc.start_date && frm.doc.end_date) {
        let start = frappe.datetime.str_to_obj(frm.doc.start_date);
        let end = frappe.datetime.str_to_obj(frm.doc.end_date);
        console.log("start", start)
        console.log("end", end)

        if (end < start) {
            frappe.msgprint("End Date cannot be before Start Date");
            frm.set_value("durationdays", null);
            return;
        }

        let days = frappe.datetime.get_diff(end, start) + 1;
        console.log("days", days)
        frm.set_value("durationdays", days);
    }
}
