// Copyright (c) 2025, Keerthana and contributors
// For license information, please see license.txt
frappe.ui.form.on("Membership Register", {
    start_date(frm) {
      if (frm.doc.start_date && frm.doc.plan) {
          let start = frappe.datetime.str_to_obj(frm.doc.start_date);
          let end;

          if (frm.doc.plan == "Monthly") {
              end = frappe.datetime.add_months(frm.doc.start_date, 1);
          } else if (frm.doc.plan == "Quarterly") {
              end = frappe.datetime.add_months(frm.doc.start_date, 3);
          } else if (frm.doc.plan == "Half-Yearly") {
              end = frappe.datetime.add_months(frm.doc.start_date, 6);
          } else if (frm.doc.plan == "Yearly") {
              end = frappe.datetime.add_months(frm.doc.start_date, 12);
          }

          if (end) {
              frm.set_value("end_date", end);
              let duration = frappe.datetime.get_diff(end, start) + 1;
              frm.set_value("durationdays", duration);
          }
      }
    },
    amount(frm){
      if(frm.doc.amount){
        frm.set_value("total_amount", frm.doc.amount);
      }
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

  	  frm.set_query("membership_plan", function() {
  	      return {
  	          filters: {
  	              membership: frm.doc.plan,
  	          }
  	      };
  	  });

    },
    member_shift(frm){
      frm.set_query("trainer", function() {
  	      return {
  	          filters: {
  	              shift: frm.doc.member_shift,
  	          }
  	      };
  	  });
    },
    refresh(frm) {
         if (frm.doc.membership_status == "Pending") {
             frm.add_custom_button(('Sales Invoice'), function () {
                 frappe.new_doc('Sales Invoice', {
                     customer: frm.doc.member,
                     custom_reference_id : frm.doc.name
                 }, (si) => {
                     if (si.items && si.items.length === 1 && !si.items[0].item_code) {
                         si.items = [];
                     }
                     let row = frappe.model.add_child(si, 'items');
                     row.item_code = frm.doc.membership_plan;
                     row.item_name = frm.doc.membership_plan;
                     row.qty = 1;
                     row.rate = frm.doc.total_amount;
                 });
             }, ('Create'));
         }
         if(frm.doc.membership_status == "Active"){
           frm.add_custom_button(('Suspend'), function () {
             frm.set_value("membership_status", "Suspend");
             frm.save();
           });
         }
         if (frm.doc.membership_status == "Expired") {
             frm.add_custom_button(__('Renew Membership'), function () {

                 let d = new frappe.ui.Dialog({
                     title: __('Renew Membership'),
                     fields: [
                         {
                             label: 'Plan',
                             fieldname: 'plan',
                             fieldtype: 'Link',
                             options: "Plan",
                             reqd: 1,
                             onchange: () => set_end_date()
                         },
                         {
                             label: 'Membership Plan',
                             fieldname: 'membership_plan',
                             fieldtype: 'Link',
                             options: 'Membership Plan',
                             reqd: 1,
                             get_query: () => {
                                 let plan = d.get_value('plan');
                                 return {
                                     filters: {
                                         membership: plan || ""
                                     }
                                 };
                             },
                             onchange: async () => {
                                 let membership_plan = d.get_value('membership_plan');
                                 if (membership_plan) {
                                     let plan_doc = await frappe.db.get_doc('Membership Plan', membership_plan);
                                     if (plan_doc && plan_doc.amount) {
                                         d.set_value('amount', plan_doc.amount);
                                     } else {
                                         d.set_value('amount', 0);
                                     }
                                 } else {
                                     d.set_value('amount', 0);
                                 }
                             }
                         },
                         {
                             label: 'Shift',
                             fieldname: 'shift',
                             fieldtype: 'Link',
                             options: 'Shift Type',
                             reqd: 1
                         },
                         {
                             label: 'Trainer',
                             fieldname: 'trainer',
                             fieldtype: 'Link',
                             options: 'Trainer',
                             reqd: 1,
                             get_query: () => {
                                 let shift = d.get_value('shift');
                                 return {
                                     filters: {
                                         shift: shift || ""
                                     }
                                 };
                             }
                         },
                         {
                             label: 'Start Date',
                             fieldname: 'start_date',
                             fieldtype: 'Date',
                             default: frappe.datetime.get_today(),
                             reqd: 1,
                             onchange: () => {
                                 set_end_date();
                                 calculate_duration();
                             }
                         },
                         {
                             label: 'End Date',
                             fieldname: 'end_date',
                             fieldtype: 'Date',
                             reqd: 1,
                             onchange: () => calculate_duration()
                         },
                         {
                             label: 'Duration (Days)',
                             fieldname: 'duration',
                             fieldtype: 'Int',
                             read_only: 1
                         },
                         {
                             label: 'Amount',
                             fieldname: 'amount',
                             fieldtype: 'Currency',
                             reqd: 1,
                             read_only: 1
                         }
                     ],
                     primary_action_label: __('Renew'),
                     primary_action: async (values) => {
                         await frappe.db.insert({
                             doctype: 'Membership Register',
                             member: frm.doc.member,
                             phone_number: frm.doc.phone_number,
                             plan: values.plan,
                             membership_plan: values.membership_plan,
                             trainer: values.trainer,
                             member_shift: values.shift,
                             start_date: values.start_date,
                             end_date: values.end_date,
                             durationdays: values.duration,
                             amount: values.amount,
                             total_amount: values.amount,
                             status: 'Pending'
                         });

                         frappe.msgprint(__('Membership Register created successfully with status Pending'));
                         d.hide();
                     }
                 });

                 function set_end_date() {
                     let plan = d.get_value('plan');
                     let start_date = d.get_value('start_date');

                     if (plan && start_date) {
                         let months_to_add = 0;

                         if (plan.toLowerCase() === "monthly") months_to_add = 1;
                         else if (plan.toLowerCase() === "quarterly") months_to_add = 3;
                         else if (plan.toLowerCase() === "half-yearly") months_to_add = 6;
                         else if (plan.toLowerCase() === "yearly") months_to_add = 12;

                         if (months_to_add > 0) {
                             let end_date = frappe.datetime.add_months(start_date, months_to_add);
                             d.set_value('end_date', end_date);
                             calculate_duration();
                         }
                     }
                 }

                 function calculate_duration() {
                     let start_date = d.get_value('start_date');
                     let end_date = d.get_value('end_date');

                     if (start_date && end_date) {
                         let duration = frappe.datetime.get_diff(end_date, start_date) + 1; // include start day
                         d.set_value('duration', duration);
                     } else {
                         d.set_value('duration', 0);
                     }
                 }

                 d.show();
             });
         }

     },
});
