(function($, task) {
"use strict";

function Events1() { // northwind_traders 

	function on_page_loaded(task) {
		
		$("title").text(task.item_caption);
		$("#title").text(task.item_caption);
		  
		if (task.safe_mode) {
			$("#user-info").text(task.user_info.role_name + ' ' + task.user_info.user_name);
			$('#log-out')
			.show() 
			.click(function(e) {
				e.preventDefault();
				task.logout();
			}); 
		}
	
		if (task.full_width) {
			$('#container').removeClass('container').addClass('container-fluid');
		}
		$('#container').show();
		
		task.create_menu($("#menu"), $("#content"), {
			// splash_screen: '<h1 class="text-center">Application</h1>',
			view_first: true
		});
		$("#menu-right #about a").click(function(e) {
			e.preventDefault();
			task.message(
				task.templates.find('.about'),
				{title: 'Jam.py framework', margin: 0, text_center: true, 
					buttons: {"OK": undefined}, center_buttons: true}
			);
		});
		
		$("#menu-right #export a").click(function(e) {
					var url = [location.protocol, '//', location.host, location.pathname].join('');
					url += 'static/internal/northwind_traders.zip';
					window.open(encodeURI(url));
					task.server('downloaded', function(error) {
						if (error) {
							task.alert_error(error);
						}
					});
	
		});
		$("#menu-right #portable a").click(function(e) {
					var url = [location.protocol, '//', location.host, location.pathname].join('');
					url += 'static/internal/jampy_win_64.exe';
					window.open(encodeURI(url));
					task.server('downloaded_portable', function(error) {
						if (error) {
							task.alert_error(error);
						}
					});
	
		});
	
		$("#menu-right #pass a").click(function(e) {
			e.preventDefault();
			task.change_password.open({open_empty: true});
			task.change_password.append_record();
		});
	
		// $(document).ajaxStart(function() { $("html").addClass("wait"); });
		// $(document).ajaxStop(function() { $("html").removeClass("wait"); });
	} 
	
	function on_view_form_created(item) {
		var table_options_height = item.table_options.height,
			table_container;
	
		item.clear_filters();
		
		item.view_options.table_container_class = 'view-table';
		item.view_options.detail_container_class = 'view-detail';
		item.view_options.open_item = true;
		
		if (item.view_form.hasClass('modal')) {
			item.view_options.width = 1060;
			item.table_options.height = $(window).height() - 300;
		}
		else {
			if (!item.table_options.height) {
				item.table_options.height = $(window).height() - $('body').height() - 20;
			}
		}
		
		if (item.can_create()) {
			item.view_form.find("#new-btn").on('click.task', function(e) {
				e.preventDefault();
				if (item.master) {
					item.append_record();
				}
				else {
					item.insert_record();
				}
			});
		}
		else {
			item.view_form.find("#new-btn").prop("disabled", true);
		}
	
		item.view_form.find("#edit-btn").on('click.task', function(e) {
			e.preventDefault();
			item.edit_record();
		});
	
		if (item.can_delete()) {
			item.view_form.find("#delete-btn").on('click.task', function(e) {
				e.preventDefault();
				item.delete_record();
			});
		}
		else {
			item.view_form.find("#delete-btn").prop("disabled", true);
		}
		
		create_print_btns(item);
	
		task.view_form_created(item);
		
		if (!item.master && item.owner.on_view_form_created) {
			item.owner.on_view_form_created(item);
		}
	
		if (item.on_view_form_created) {
			item.on_view_form_created(item);
		}
		
		item.create_view_tables();
		
		if (!item.master && item.view_options.open_item) {
			item.open(true);
		}
	
		if (!table_options_height) {
			item.table_options.height = undefined;
		}
		return true;
	}
	
	function on_view_form_shown(item) {
		item.view_form.find('.dbtable.' + item.item_name + ' .inner-table').focus();
	}
	
	function on_view_form_closed(item) {
		if (!item.master && item.view_options.open_item) {	
			item.close();
		}
	}
	
	function on_edit_form_created(item) {
		item.edit_options.inputs_container_class = 'edit-body';
		item.edit_options.detail_container_class = 'edit-detail';
		
		item.edit_form.find("#cancel-btn").on('click.task', function(e) { item.cancel_edit(e) });
		item.edit_form.find("#ok-btn").on('click.task', function() { item.apply_record() });
		if (!item.is_new() && !item.can_modify) {
			item.edit_form.find("#ok-btn").prop("disabled", true);
		}
		
		task.edit_form_created(item);
		
		if (!item.master && item.owner.on_edit_form_created) {
			item.owner.on_edit_form_created(item);
		}
	
		if (item.on_edit_form_created) {
			item.on_edit_form_created(item);
		}
			
		item.create_inputs(item.edit_form.find('.' + item.edit_options.inputs_container_class));
		item.create_detail_views(item.edit_form.find('.' + item.edit_options.detail_container_class));
	
		return true;
	}
	
	function on_edit_form_close_query(item) {
		var result = true;
		if (item.is_changing()) {
			if (item.is_modified()) {
				item.yes_no_cancel(task.language.save_changes,
					function() {
						item.apply_record();
					},
					function() {
						item.cancel_edit();
					}
				);
				result = false;
			}
			else {
				item.cancel_edit();
			}
		}
		return result;
	}
	
	function on_filter_form_created(item) {
		item.filter_options.title = item.item_caption + ' - filters';
		item.create_filter_inputs(item.filter_form.find(".edit-body"));
		item.filter_form.find("#cancel-btn").on('click.task', function() {
			item.close_filter_form(); 
		});
		item.filter_form.find("#ok-btn").on('click.task', function() { 
			item.set_order_by(item.view_options.default_order);
			item.apply_filters(item._search_params); 
		});
	}
	
	function on_param_form_created(item) {
		item.create_param_inputs(item.param_form.find(".edit-body"));
		item.param_form.find("#cancel-btn").on('click.task', function() { 
			item.close_param_form();
		});
		item.param_form.find("#ok-btn").on('click.task', function() { 
			item.process_report();
		});
	}
	
	function on_before_print_report(report) {
		var select;
		report.extension = 'pdf';
		if (report.param_form) {
			select = report.param_form.find('select');
			if (select && select.val()) {
				report.extension = select.val();
			}
		}
	}
	
	function on_view_form_keyup(item, event) {
		if (event.keyCode === 45 && event.ctrlKey === true){
			if (item.master) {
				item.append_record();
			}
			else {
				item.insert_record();				
			}
		}
		else if (event.keyCode === 46 && event.ctrlKey === true){
			item.delete_record(); 
		}
	}
	
	function on_edit_form_keyup(item, event) {
		if (event.keyCode === 13 && event.ctrlKey === true){
			item.edit_form.find("#ok-btn").focus(); 
			item.apply_record();
		}
	}
	
	function create_print_btns(item) {
		var i,
			$ul,
			$li,
			reports = [];
		if (item.reports) {
			for (i = 0; i < item.reports.length; i++) {
				if (item.reports[i].can_view()) {
					reports.push(item.reports[i]);
				}
			}
			if (reports.length) {
				$ul = item.view_form.find("#report-btn ul");
				for (i = 0; i < reports.length; i++) {
					$li = $('<li><a href="#">' + reports[i].item_caption + '</a></li>');
					$li.find('a').data('report', reports[i]);
					$li.on('click', 'a', function(e) {
						e.preventDefault();
						$(this).data('report').print(false);
					});
					$ul.append($li);
				}
			}
			else {
				item.view_form.find("#report-btn").hide();
			}
		}
		else {
			item.view_form.find("#report-btn").hide();
		}
	}
	this.on_page_loaded = on_page_loaded;
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_view_form_closed = on_view_form_closed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_filter_form_created = on_filter_form_created;
	this.on_param_form_created = on_param_form_created;
	this.on_before_print_report = on_before_print_report;
	this.on_view_form_keyup = on_view_form_keyup;
	this.on_edit_form_keyup = on_edit_form_keyup;
	this.create_print_btns = create_print_btns;
}

task.events.events1 = new Events1();

function Events7() { // northwind_traders.catalogs.customers 

	function on_view_form_created(item) {
		if (!item.lookup_field) {
			item.table_options.height -= 200;
			item.orders = task.orders.copy();
			item.orders.paginate = false;
			item.orders.create_table(item.view_form.find('.view-detail'), {
				height: 200,
				summary_fields: ['order_date', 'order_id'],
	//			on_dblclick: function() {
	//				show_p_order(item.orders);
	//			}
			});
	
		}
	}
	
	var scroll_timeout;
	
	function on_after_scroll(item) {
		if (!item.lookup_field && item.view_form.length) {
			clearTimeout(scroll_timeout);
			scroll_timeout = setTimeout(
				function() {
					if (item.rec_count) {
						item.orders.set_where({customer_id: item.id.value});
						item.orders.set_order_by(['-order_date']);
						//item.orders.open({fields: ['order_date', 'status_id', 'employee_id', 'customer_id', ]});
						item.orders.open(true);
					}
					else {
						item.orders.close();
					}
				},
				100
			);
		}
	}
	function on_edit_form_created(item) {
		if (item.is_new()) {
			item.edit_options.title = 'New entry';
		}   else {
				item.edit_options.title = item.first_name.value + ' ' + item.last_name.value;
		}
		
		let send_email_btn = item.add_edit_button('Send email', {type: 'success', image: 'icon-pencil', btn_id: 'send_email_btn'});
			send_email_btn.click(function() { 
				//item.warning('Email sending...');
				task.suppliers.send_email(item, item.email_address.value, item.first_name.value, item.last_name.value);
			});
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_scroll = on_after_scroll;
	this.on_edit_form_created = on_edit_form_created;
}

task.events.events7 = new Events7();

function Events8() { // northwind_traders.catalogs.employees 

	function on_view_form_created(item) {
		if (!item.lookup_field) {
			item.table_options.height -= 200;
			item.orders = task.orders.copy();
			item.orders.paginate = false;
			item.orders.create_table(item.view_form.find('.view-detail'), {
				height: 200,
				summary_fields: ['order_date', 'order_id'],
	//			on_dblclick: function() {
	//				show_p_order(item.orders);
	//			}
			});
	
		}
	}
	
	var scroll_timeout;
	
	function on_after_scroll(item) {
		if (!item.lookup_field && item.view_form.length) {
			clearTimeout(scroll_timeout);
			scroll_timeout = setTimeout(
				function() {
					if (item.rec_count) {
						item.orders.set_where({employee_id: item.id.value});
						item.orders.set_order_by(['-order_date']);
						//item.orders.open({fields: ['order_date', 'status_id', 'employee_id', 'customer_id', ]});
						item.orders.open(true);
					}
					else {
						item.orders.close();
					}
				},
				100
			);
		}
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_scroll = on_after_scroll;
}

task.events.events8 = new Events8();

function Events9() { // northwind_traders.catalogs.suppliers 

	function on_view_form_created(item) {
		if (!item.lookup_field) {
			item.table_options.height -= 200;
			item.purchase_orders = task.purchase_orders.copy();
			item.purchase_orders.paginate = false;
			item.purchase_orders.create_table(item.view_form.find('.view-detail'), {
				height: 200,
				summary_fields: ['submitted_date', 'purchase_order_id'],
			//	 on_dblclick: function() {
			//		 show_p_order(item.order_details);
			//	 }
			});
	
		}
	}
	
	var scroll_timeout;
	
	function on_after_scroll(item) {
		if (!item.lookup_field && item.view_form.length) {
			clearTimeout(scroll_timeout);
			scroll_timeout = setTimeout(
				function() {
					if (item.rec_count) {
						item.purchase_orders.set_where({supplier_id: item.id.value});
						item.purchase_orders.set_order_by(['-submitted_date']);
						item.purchase_orders.open(true);
					}
					else {
						item.purchase_orders.close();
					}
				},
				100
			);
		}
	}
	function on_edit_form_created(item) {
		if (item.is_new()) {
			item.edit_options.title = 'New entry';
		}   else {
			item.edit_options.title = item.company.value;
		}
		
		let send_email_btn = item.add_edit_button('Send email', {type: 'success', image: 'icon-pencil', btn_id: 'send_email_btn'});
			send_email_btn.click(function() { 
				//item.warning('Email sending...');
				send_email(item, item.email_address.value, item.first_name.value, item.last_name.value);
			});
	}
	
	function send_email(item, email_address, first_name, last_name) {
		task.mail.open({open_empty: true});
		task.mail.edit_options.title = 'Send email to: ' + first_name + ' ' + last_name;
		task.mail.append_record();
		
		task.mail.email_address.value = email_address;
		task.mail.edit_form.find('input.subject').focus();
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_scroll = on_after_scroll;
	this.on_edit_form_created = on_edit_form_created;
	this.send_email = send_email;
}

task.events.events9 = new Events9();

function Events10() { // northwind_traders.catalogs.products 

	function on_field_get_html(field){
		if (field.field_name === 'supplier_ids' && field.value){
			let suppliers = task.suppliers.copy({handlers: false}),
				suppliers_list = [];
				
				suppliers.set_where({id__in: field.value});
				suppliers.open({fields: ['company']});
				
				suppliers.each(function(s){
				   suppliers_list.push(s.company.value); 
				});
	
				return `<span class="label label-default">${suppliers_list}</span>`;
		}
	}
	
	function on_field_get_text(field) {
		if (field.field_name === 'supplier_ids' && field.value){
			let suppliers = task.suppliers.copy({handlers: false}),
				suppliers_list = [];
				
				suppliers.set_where({id__in: field.value});
				suppliers.open({fields: ['company']});
				
				suppliers.each(function(s){
				   suppliers_list.push(s.company.value); 
				});
	
				return suppliers_list;
		}
	}
	function on_view_form_created(item) {
		item.add_view_button('Pump data', {type: 'primary', image: 'icon-check', btn_id: 'pump_product_data'}).click(function() {
			pump_product_data(item);		
		});			
		
		if (!item.lookup_field) {
			item.table_options.height -= 200;
			item.order_details = task.order_details.copy();
			item.order_details.paginate = false;
			item.order_details.create_table(item.view_form.find('.view-detail'), {
				height: 200,
				summary_fields: ['date_allocated', 'quantity'],
				on_dblclick: function() {
					show_order(item.order_details);
				}
			});
			item.alert('Double-click the record in the bottom table to see the order in which the product was sold.');
			
		}
	}
	
	var scroll_timeout;
	
	function on_after_scroll(item) {
		if (!item.lookup_field && item.view_form.length) {
			clearTimeout(scroll_timeout);
			scroll_timeout = setTimeout(
				function() {
					if (item.rec_count) {
						item.order_details.set_where({product_id: item.id.value});
						item.order_details.set_order_by(['-date_allocated']);
						item.order_details.open(true);
					}
					else {
						item.order_details.close();
					}
				},
				100
			);
		}
	}
	
	function show_order(order_details) {
		var orders = task.orders.copy();
		orders.set_where({order_id: order_details.order_id.value});
		orders.open(function(i) {
			i.edit_options.modeless = false;
			i.can_modify = false;
			i.order_details.on_after_open = function(t) {
				t.locate('id', order_details.order_id.value);
			};
			i.edit_record();
		});
	}
	function on_edit_form_created(item) {
		if (item.is_new()) {
			item.edit_options.title = 'New product';
		}   else {
			item.edit_options.title = 'Product ID: ' + item.id.value;
		}
	}
	
	function on_edit_form_shown(item) {
		//hide purchase_order_details tab when new record
		if (item.is_new()) {
			$('[href="#tab11"]').hide();
		}
		//show purchase_order_details in tab 
		$(".edit-body").find("li").on("click", function() {
			if ($(".edit-body").find("li.active a").text() == ("Orders History") ) {
				$(".purchase_details").css("display","block");
		
				let purchase_details = task.purchase_order_details.copy();
					purchase_details.set_where({product_id: item.id.value});
					purchase_details.set_order_by(['-date_received']);
					purchase_details.view_options.template_class = 'default-view';
					purchase_details.view_options.form_header = false;
					purchase_details.table_options.height = 400; 
					purchase_details.view(item.edit_form.find(".purchase_details"));
					purchase_details.view_form.find('.form-footer').hide();
					
				purchase_details.on_edit_form_created = function(c){
					c.read_only = true;
				};
			}   else {
					$(".purchase_details").css("display","none");
				}
		});
	}
	
	// function pump_product_data(item) {
	//	 item.alert('This will take a while in the background. The database will be locked!');
	//	 item.server('pump_product_data', 
	//		 function(result, err) {
	//			 if (err) {
	//				 item.alert_error('Failed to pump data: ' + err);
	//				 item.edit();
	//			 }
	//			 else {
	//				 item.alert('Successfully pumped');
	//				 item.close_edit_form();
	//				 item.delete();			
	//			 }
	//		 }
	//	 );
	//	 item.refresh();
	
		
	// }
	this.on_field_get_html = on_field_get_html;
	this.on_field_get_text = on_field_get_text;
	this.on_view_form_created = on_view_form_created;
	this.on_after_scroll = on_after_scroll;
	this.show_order = show_order;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
}

task.events.events10 = new Events10();

function Events11() { // northwind_traders.catalogs.shippers 

	function on_view_form_created(item) {
		if (!item.lookup_field) {
			item.table_options.height -= 200;
			item.orders = task.orders.copy();
			item.orders.paginate = false;
			item.orders.create_table(item.view_form.find('.view-detail'), {
				height: 200,
				summary_fields: ['order_date', 'order_id'],
	//			on_dblclick: function() {
	//				show_p_order(item.orders);
	//			}
			});
	
		}
	}
	
	var scroll_timeout;
	
	function on_after_scroll(item) {
		if (!item.lookup_field && item.view_form.length) {
			clearTimeout(scroll_timeout);
			scroll_timeout = setTimeout(
				function() {
					if (item.rec_count) {
						item.orders.set_where({shipper_id: item.id.value});
						item.orders.set_order_by(['-order_date']);
						//item.orders.open({fields: ['order_date', 'status_id', 'employee_id', 'customer_id', ]});
						item.orders.open(true);
					}
					else {
						item.orders.close();
					}
				},
				100
			);
		}
	}
	function on_edit_form_created(item) {
		if (item.is_new()) {
			item.edit_options.title = 'New entry';
		}   else {
			item.edit_options.title = item.company.value;
		}
		
		let send_email_btn = item.add_edit_button('Send email', {type: 'success', image: 'icon-pencil', btn_id: 'send_email_btn'});
			send_email_btn.click(function() { 
				//item.warning('Email sending...');
				task.suppliers.send_email(item, item.email_address.value, item.first_name.value, item.last_name.value);
			});
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_scroll = on_after_scroll;
	this.on_edit_form_created = on_edit_form_created;
}

task.events.events11 = new Events11();

function Events13() { // northwind_traders.orders_menu.orders 

	function on_view_form_created(item) {
			item.add_view_button('Pump data', {type: 'primary', image: 'icon-check', btn_id: 'pump_data'}).click(function() {
				pump_data(item);		
			});			
	}
	function pump_data(item) {
		item.warning('Not in Demo...');	
	}
	// function pump_data(item) {
	//	 item.server('pump_data', 
	//		 function(result, err) {
	//			 if (err) {
	//				 item.alert_error('Failed to pump data: ' + err);
	//				 item.edit();
	//			 }
	//			 else {
	//				 item.alert('Successfully pumped');
	//				 item.close_edit_form();
	//				 item.delete();			
	//			 }
	//		 }
	//	 );
	// }
	function on_edit_form_created(item) {
		item.customer_id.required = true;
		item.employee_id.required = true;
		item.order_date.required = true;
	
		if (item.payment_type.value === 'Credit Card') {
			item.payment_type.value = "Credit Card";
		}
		else if (item.payment_type.value === 'Cash') {
			item.payment_type.value = "Cash";
		}
		else if (item.payment_type.value === 'Check') {
			item.payment_type.value = "Check";
		}
		
		if (item.is_new()) {
			item.edit_options.title = 'New order';
			//new code 16.04.
			item.employee_id.value = task.user_info.user_id;
			item.employee_id.lookup_value = task.user_info.user_name;
			item.order_date.value = new Date();
		}   else {
			item.edit_options.title = 'Order: #' + item.order_id.value + ' - ' + item.status_id.display_text;
		}
		
		if (item.status_id.value === 3) {
			item.read_only = true;
		}   else {
			item.read_only = false;
		}
		
		let clear_address_btn = item.add_edit_button('Clear Address', {type: 'warning', image: 'icon-tint', btn_id: 'clear_address_btn'});
			clear_address_btn.click(function() { 
				clear_address_data(item);
			});
			
		let create_invoice_btn = item.add_edit_button('Create Invoice', {type: 'primary', image: 'icon-file', btn_id: 'create_invoice_btn'});
			create_invoice_btn.click(function() { 
				create_invoice(item);
			});
			
		let print_invoice_btn = item.add_edit_button('Print Invoice', {type: 'primary', image: 'icon-print', btn_id: 'print_invoice_btn'});
			print_invoice_btn.click(function() { 
				print_invoice(item);
			});
			
		let ship_order_btn = item.add_edit_button('Ship order', {type: 'success', image: 'icon-globe', btn_id: 'ship_order_btn'});
			ship_order_btn.click(function() { 
				ship_order(item);
			});
			
		//new code 16.04.
		item.edit_form.find('#clear_address_btn, #create_invoice_btn, #print_invoice_btn, #ship_order_btn').addClass('pull-right');
	}
	
	function on_edit_form_shown(item) {
		if  ($(window).width() > 480) {
			item.edit_form.find('input.payment_type').width(100);
			item.edit_form.find('input.shipper_id').width(180);
			item.edit_form.find('input.shipped_date').width(100);
			
			item.edit_form.find('input.ship_name').width(450);
			item.edit_form.find('input.ship_address').width(450);
			item.edit_form.find('input.ship_city').width(450);
			item.edit_form.find('input.ship_state_province').width(450);
			item.edit_form.find('input.ship_zip_postal_code').width(450);
			item.edit_form.find('input.ship_country_region').width(450);
			item.edit_form.find('.edit-body').height(325);
		}
		
		//new code 16.04.
		item.edit_form.find('#print_invoice_btn').hide();
		
		if (item.status_id.value !== 0) {
			item.edit_form.find('#create_invoice_btn').hide();
			item.edit_form.find('#print_invoice_btn').show();
		}
	}
	
	function on_field_changed(field, lookup_item) {
		let item = field.owner;
		
		if (field.field_name ==='customer_id' && lookup_item) {
			item.ship_name.value = lookup_item.first_name.value + ' ' + lookup_item.last_name.value;
			item.ship_address.value = lookup_item.address.value;
			item.ship_city.value = lookup_item.city.value;
			item.ship_state_province.value = lookup_item.state_province.value;
			item.ship_zip_postal_code.value = lookup_item.zip_postal_code.value;
			item.ship_country_region.value = lookup_item.country_region.value;
			
			item.post();
			item.apply();
			item.edit();
		}
	}
	
	function clear_address_data(item) {
		item.question('Do you realy want to clear Address information?',
			function() {
				item.ship_name.value = '';
				item.ship_address.value = '';
				item.ship_city.value = '';
				item.ship_state_province.value = '';
				item.ship_zip_postal_code.value = '';
				item.ship_country_region.value = '';
			});
	}
	
	function create_invoice(item) {
		item.question('Do you realy want to create Invoice',
			function() {
				if(item.shipper_id.value && item.order_details.rec_count) {
					let invoice = task.invoices.copy({hanlders: false});
						//invoice.set_where({order_id: item.id.value});
						invoice.open({open_empty: true});
						
							try {
								invoice.append();
								
								invoice.order_id.value = item.order_id.value;
								invoice.invoice_date.value = new Date();
								invoice.shipping.value = item.shipping_fee.value;
								invoice.tax.value = 0;
								invoice.amount_due.value = 0;
								invoice.post();
								invoice.apply();
								item.warning('Invoice is succesfully created!');
								item.status_id.value = 1;
								item.post();
								item.apply();
								item.edit_form.find('.header-title').text('Order: #' + item.order_id.value + ' - Invoiced');
							}
							catch (error) {
								item.warning(error);
							}
							item.edit();
						}
						
				else if (!item.shipper_id.value){
					item.warning('Shipper ID is required!');
				}
				
				else if (!item.order_details.rec_count){
					item.warning('Order must contain all lest one detail!');
				}
			});
	}
	
	function ship_order(item) {
		item.question('Do you realy want to ship this order',
			function() {
				item.warning('Not implemented...');
			});
	}
	
	function on_after_post(item) {
	//new code 16.04.
		if (item.is_new()) {
			item.status_id.value = 0;
		}
	}
	
	function print_invoice(item) {
		//new code 16.04.
		task.invoice.print(true);
	}
	
	function on_field_get_html(field) {
		if (field.field_name === 'status_id' && field.value) {
			if (field.value) {
				return '<span class="label label-info">' + field.display_text + '</span>';
			}
		}
	}
	this.on_view_form_created = on_view_form_created;
	this.pump_data = pump_data;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_field_changed = on_field_changed;
	this.clear_address_data = clear_address_data;
	this.create_invoice = create_invoice;
	this.ship_order = ship_order;
	this.on_after_post = on_after_post;
	this.print_invoice = print_invoice;
	this.on_field_get_html = on_field_get_html;
}

task.events.events13 = new Events13();

function Events28() { // northwind_traders.inventory_menu.purchase_orders 

	function on_view_form_created(item) {
			item.table_options.multiselect = true;
			
			//this is save button in Access app
			/*item.add_view_button('Submit for approval').click(function() {
				to_approve(item);
			});*/   
	
			item.add_view_button('Cancel PO', {type: 'danger', image: 'icon-remove'}).click(function() {
				cancel_po(item);
			});
			//first
			item.add_view_button('Approve PO - multiple', {type: 'primary', image: 'icon-check', btn_id: 'approve_po_multiple'}).click(function() {
				approve_po_multiple(item);
			});
			item.add_view_button('Pump data', {type: 'primary', image: 'icon-check', btn_id: 'pump_data'}).click(function() {
				pump_po_data(item);		
			});			
	}
	
	// function pump_po_data(item) {
	//	 item.alert('This will take a while in the background. The database will be locked!');
	//	 item.server('pump_po_data', 
	//		 function(result, err) {
	//			 if (err) {
	//				 item.alert_error('Failed to pump data: ' + err);
	//				 item.edit();
	//			 }
	//			 else {
	//				 item.alert('Successfully pumped');
	//				 item.close_edit_form();
	//				 item.delete();			
	//			 }
	//		 }
	//	 );
	
		
	// }
	
	function to_approve(item){
		item.alert('Not yet implemented!');
	}
	
	function approve_po_single(item){
		//new code
		item.question('Do you realy want to approve purchase order '+ item.purchase_order_id.value + ' ?',
			function() {
				item.edit();
				item.status_id.value = 2;
				item.approved_date.value = new Date();
				item.approved_by.value = task.user_info.user_id;
				item.approved_by.lookup_value = task.user_info.user_name;
				item.post();
				item.apply();
				item.edit();
				item.edit_form.find("#approve_po_single").hide();
				item.warning('Purchase is approved!');
		});
	}
	
	function approve_po_multiple(item){
		let selections = item.selections,
			selectionss = [];
			if (selections.length === 0) {
				selections = [item.id.value];
			}
		
		item.question('Do you realy want to approve purchase for  (' + selections.length + ')  orders??',
			function() {
				item.server('approve_po_multiple', [selections], function(res, error) {
					if (error) {
						item.warning(error);
					}   else {
						item.selections = [];
						item.warning('Done!');
						item.refresh_page(true);
					}
			});
		});
	
	}
	
	function cancel_po(item){
		item.purchase_order_details.set_where({posted_to_inventory: true});
		item.purchase_order_details.open();
		if (item.purchase_order_details.rec_count) {
			item.warning('Deletion is prohibited! There are products received  and posted to inventory!');
		}   else {
			item.question('Do you realy want to cancel order and delete it permanently?',
				function() {
					item.delete();
					item.warning('Purchase order has deleted!');
				});
		}
	}
	
	function on_edit_form_shown(item) {
		if  ($(window).width() > 480) {
			item.edit_form.find('input.payment_method').width(100);
		}
		
		if (item.is_new()) {
			item.edit_options.title = 'New purchase';
			item.edit_form.find("#approve_po_single").hide();
		}
		
		if (!item.is_new()) {
			item.supplier_id.read_only = true;
			item.created_by.read_only = true;
			item.submitted_by.read_only = true;
			item.approved_by.read_only = true;
			item.creation_date.read_only = true;
			item.submitted_date.read_only = true;
			item.approved_date.read_only = true;
		} else {
			item.supplier_id.read_only = false;
			item.created_by.read_only = false;
			item.submitted_by.read_only = false;
			item.approved_by.read_only = false;
			item.creation_date.read_only = false;
			item.submitted_date.read_only = false;
			item.approved_date.read_only = false;
		}
	
		
		if (item.status_id.value >= 2) {
			item.edit_form.find("#approve_po_single").hide();
		}
	}
	
	function on_edit_form_created(item) {
		if (item.payment_method.value === 'Credit Card') {
			item.payment_method.value = "Credit Card";
		}
		else if (item.payment_method.value === 'Cash') {
			item.payment_method.value = "Cash";
		}
		else if (item.payment_method.value === 'Check') {
			item.payment_method.value = "Check";
		}
		
		if (item.is_new()) {
			item.edit_options.title = 'New purchase';
	
		}   else {
			item.edit_options.title = 'Purchase: #' + item.purchase_order_id.value + ' - ' + item.status_id.display_text;
		}
		
		//first
		item.add_edit_button('Approve PO', {type: 'primary', image: 'icon-check', btn_id: 'approve_po_single'}).click(function() {
			approve_po_single(item);
		});
		
		item.edit_form.find("#approve_po_single").addClass("pull-right");
	}
	
	function on_field_get_html(field) {
		if (field.field_name === 'status_id' && field.value) {
			if (field.value == 1) {
				return '<span class="label label-default">' + field.display_text + '</span>';
			}   else {
				return '<span class="label label-success">' + field.display_text + '</span>';
			}
		}
	}
	
	function on_field_changed(field, lookup_item) {
		let item = field.owner;
		
		if (field.field_name === 'payment_method') {
			item.payment_method.value = field.display_text;
		}	
	}
	this.on_view_form_created = on_view_form_created;
	this.to_approve = to_approve;
	this.approve_po_single = approve_po_single;
	this.approve_po_multiple = approve_po_multiple;
	this.cancel_po = cancel_po;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_edit_form_created = on_edit_form_created;
	this.on_field_get_html = on_field_get_html;
	this.on_field_changed = on_field_changed;
}

task.events.events28 = new Events28();

function Events30() { // northwind_traders.authentication.change_password 

	function on_edit_form_created(item) {
	// bind buttons to stuff
		item.edit_form.find("#ok-btn")
			.off('click.task')
			.on('click', function() {
				change_password(item);
			});
	}
	
	
	function on_edit_form_shown(item) {
	// the original below "var divcode" was moved to index.html	
	// see https://groups.google.com/g/jam-py/c/pAAdadXRSg8
		
	// divcode holds the empty div for the password meter
	// plus the informational message about picking strong passwords
	//	var divcode =
	//	`<div id="new_password_strength_meter" class="col-md-10 col-md-offset-2"></div>
	//	<div>Your password needs to be strong; a wide-range of letters, numbers and symbols, or long passwords will achieve this.  Passwords with more than 80 bits of entropy should meet this requirement.</div>`;
	// makes text boxes password boxes   
		$('input.old_password').prop("type", "password");  
		$('input.new_password').prop("type", "password");
	   
	//below is not needed after moving to index.html
	//	$('input.new_password').after(divcode);
	   
		var max = 140;  // lots of entropy in password
		$('#new_password_strength_meter').entropizer({
		target: 'input.new_password',
		maximum: max,
		buckets: [
			{ max: 40, suffix: 'danger' },
			{ min: 40, max: 80, suffix: 'warning' },
			{ min: 80, max: 120, suffix: 'success' },
			{ min: 120, suffix: 'info' }
		],
		create: function(container) {
			var wrapper = $('<div>').addClass('progress progress-striped').appendTo(container);
			var bar = $('<div>').addClass('bar')
				.attr({
					'role': 'progressbar',
					'aria-valuemin': 0,
					'aria-valuemax': max
				})
				.appendTo(wrapper);
			return {
				wrapper: wrapper,
				bar: bar
			};
		},
		update: function(data, ui) {
			ui.bar.css({
					'width': data.percent + '%'
				})
				.attr({
					'aria-valuenow': data.entropy
				})
				.text(' ' + data.entropy.toFixed(0) + ' bits of entropy');
			ui.bar[0].className = 'bar bar-' + data.suffix;
		},
		destroy: function(ui) {
			ui.wrapper.remove();
		}
	});  
	}
	
	
	function change_password(item) {
		item.post();
		item.server('change_password', [item.old_password.value, item.new_password.value], function(res) {
			if (res === 'changed') {
				item.alert_success('Password has been changed successfully!');
				item.close_edit_form();
			}
			else {
				item.alert_error(res);	
				item.edit();
			}
		});
	}
	
	function on_field_changed(field, lookup_item) {
		var item = field.owner;
		var oldPassError = $('<div id="oldpassworderror" style="margin-left: 180px; margin-bottom: 12px;">Old password entered incorrectly.</div>');
		if (field.field_name === 'old_password') {
			$('#oldpassworderror').hide();
			item.server('check_old_password', [field.value], function(error) {
				if (error) {
					item.alert_error(error);
					oldPassError.insertAfter('div.control-group:nth-child(1)');
				   
				}
			});
		}
	}
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
	this.change_password = change_password;
	this.on_field_changed = on_field_changed;
}

task.events.events30 = new Events30();

function Events32() { // northwind_traders.analytics.dashboard 

	function on_view_form_created(item) {
		show_orders(item, item.view_form.find('#orders-canvas').get(0).getContext('2d'));
		show_categories(item, item.view_form.find('#categories-canvas').get(0).getContext('2d'));
	}
	
	function show_orders(item, ctx) {
		var ord = item.task.purchase_order_details.copy({handlers: false});
		ord.open(
			{
				fields: ['id', 'product_id', 'quantity', 'unit_cost'], 
				funcs: {quantity: 'sum'},
				group_by: ['product_id'],
				order_by: ['-quantity'],
				limit: 10
			}, 
			function() {
				var labels = [],
					data = [],
					colors = [];
				ord.each(function(i) {
					labels.push(i.product_id.display_text);
					data.push(i.quantity.value.toFixed(2));
					colors.push(lighten('#006bb3', (i.rec_no - 1) / 10));
				});
				ord.first();
				// ord.product_id.field_caption = 'Orders';			
				draw_chart(item, ctx, labels, data, colors, '10 Biggest orders');
				ord.create_table(item.view_form.find('#orders-table'), 
					{row_count: 10, dblclick_edit: false});						
			}
		);
		return ord;
	}
	
	function show_categories(item, ctx) {
		var acc = item.task.products.copy({handlers: false});
		acc.open(
			{
				fields: ['id', 'category', 'standard_cost'], 
				funcs: {'standard_cost': 'avg'},
				group_by: ['category'],
				order_by: ['category'],
				limit: 10
			}, 
			function() {
				var labels = [],
					data = [],
					colors = [];
				acc.each(function(i) {
					labels.push(i.category.display_text);
					data.push(i.standard_cost.value);
					colors.push(lighten('#006bb3', (i.rec_no - 1) / 10));
				});
				acc.first();
				acc.category.field_caption = 'Category';
				draw_chart(item, ctx, labels, data, colors, 'Median Cost for category');
				acc.create_table(item.view_form.find('#categories-table'), 
					{row_count: 10, dblclick_edit: false});						
			}
		);
		return acc;
	}
	
	
	function show_tracks(item, ctx) {
		var tracks = item.task.tracks.copy({handlers: false});
		tracks.open(
			{
				fields: ['name', 'tracks_sold'], 
				order_by: ['-tracks_sold'],
				limit: 10
			}, 
			
			function() {
				var labels = [],
					data = [],
					colors = [];
				tracks.each(function(t) {
					labels.push(t.name.display_text);
					data.push(t.tracks_sold.value);
					colors.push(lighten('#196619', (t.rec_no - 1) / 10));
				});
				tracks.first();
				tracks.name.field_caption = 'Track';
				draw_chart(item, ctx, labels, data, colors, 'Ten most popular tracks');
				tracks.create_table(item.view_form.find('#tracks-table'), 
					{row_count: 10, dblclick_edit: false});
			}
		);
		return tracks;
	}
	
	function draw_chart(item, ctx, labels, data, colors, title) {
		new Chart(ctx,{
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: colors
					}
				]					
			},
			options: {
				 title: {
					display: true,
					fontsize: 14,
					text: title
				},
				legend: {
					display: false,
					position: 'bottom',
				},
			}
		});
	}
	function draw_pie(item, ctx, labels, data, colors, title) {
		new Chart(ctx,{
			type: 'pie',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: colors
					}
				]					
			},
			options: {
				 title: {
					display: true,
					fontsize: 14,
					text: title
				},
				legend: {
					display: false,
					position: 'bottom',
				},
			}
		});
	}
	
	function lighten(color, luminosity) {
		color = color.replace(/[^0-9a-f]/gi, '');
		if (color.length < 6) {
			color = color[0]+ color[0]+ color[1]+ color[1]+ color[2]+ color[2];
		}
		luminosity = luminosity || 0;
		var newColor = "#", c, i, black = 0, white = 255;
		for (i = 0; i < 3; i++) {
			c = parseInt(color.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(black, c + (luminosity * white)), white)).toString(16);
			newColor += ("00"+c).substr(c.length);
		}
		return newColor; 
	}
	this.on_view_form_created = on_view_form_created;
	this.show_orders = show_orders;
	this.show_categories = show_categories;
	this.show_tracks = show_tracks;
	this.draw_chart = draw_chart;
	this.draw_pie = draw_pie;
	this.lighten = lighten;
}

task.events.events32 = new Events32();

function Events36() { // northwind_traders.inventory_menu.inventory_list 

	function on_view_form_created(item) {
		item.paginate = false;
		item.table_options.new = false;
		if (!item.lookup_field) {	
			var purchase_btn = item.add_view_button('Purchase', {image: 'icon-pencil'});
			purchase_btn.click(function() { purchase(item) });
		}
				item.view_form.find("#edit-btn").hide();
				item.view_form.find("#delete-btn").hide();
				item.view_form.find("#new-btn").hide();
	}
	
	function on_after_open(item) {
		// item.alert('Working!');
		item.server('get_records', function(records) {
			item.disable_controls();
			try {
				records.forEach(function(rec) {
					item.append();
					item.id.value = rec.product_id;			
					item.product_name.value = rec.product_name;
					item.target_level.value = rec.target_level;
					item.quantity_on_hold.value = rec.quantity_on_hold;
					item.quantity_on_order.value = rec.quantity_on_order;
					item.quantity_on_back_order.value = rec.quantity_on_back_order;
					item.quantity_on_hand.value = rec.quantity_on_hand;
					item.quantity_purchased.value = rec.quantity_purchased;			
					item.quantity_sold.value = rec.quantity_sold;			
					item.post();
				});
				item.first();
			}
			finally {
				item.enable_controls();
			}
		});
	}
	
	function on_edit_form_created(item) {
		var title = 'Purchase ';
		item.edit_options.title = title;
		item.edit_form.find('#ok-btn')
			.text('Purchase')
			.off('click.task')
			.on('click', function() {
				purchase(item);
			});
	}
	function on_field_get_html(field) {
		let item = field.owner;
		if (field.field_name === 'quantity_on_hand') {
			let color = 'green';
			if (item.quantity_on_hand.display_text < 30) {
				color = 'red';
			}
			return '<span style="color: ' + color + ';">' + field.display_text + '</span>';
		}
	}
	
	function purchase(item){
				item.alert('Not yet implemented!');
		
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_open = on_after_open;
	this.on_edit_form_created = on_edit_form_created;
	this.on_field_get_html = on_field_get_html;
	this.purchase = purchase;
}

task.events.events36 = new Events36();

function Events39() { // northwind_traders.inventory_menu.purchase_orders.purchase_order_details 

	function on_field_changed(field, lookup_item) {
		let item = field.owner;
		
		if (field.field_name ==='product_id' && lookup_item) {
			item.unit_cost.value = lookup_item.standard_cost.value;
		}
		
		if (field.field_name ==='quantity' && field.value) {
			item.total_price.value = field.value * item.unit_cost.value;
			item.owner.post();
			item.owner.apply();
			item.owner.edit();
			item.edit();
		}
	}
	
	function on_edit_form_created(item) {
		if (item.is_new()) {
			item.edit_options.title = 'New purchase order detail - ' + item.owner.supplier_id.display_text;
		}   else {
			item.edit_options.title = 'Edit purchase order detail - ' + item.owner.supplier_id.display_text;
		}
		
		item.add_edit_button('Recive PO', {type: 'warning', image: 'icon-plus-sign', btn_id: 'recive_po'}).click(function() {
			recive_po(item);
		});
		
		item.edit_form.find("#recive_po").addClass("pull-left");
	}
	
	function on_view_form_created(item) {
		if (item.owner.status_id.value >= 2) {
			item.table_options.editable_fields = [];
		}   else {
			item.table_options.editable_fields = ['quantity'];
		}
	}
	
	function recive_po(item) {
		//new code
		item.question('Do you realy want to recive purchase order?',
			function() {
			item.edit();
			item.date_received.value = new Date();
			item.posted_to_inventory.value = true;
			item.owner.post();
			item.owner.apply();
			item.owner.edit();
			item.edit();
			create_inv_trans(item);
		});
	}
	
	function create_inv_trans(item) {
		//new code
		item.question('Do you realy want to post produst to inventory?',
			function() {
				let inv_trans = task.inventory_transactions.copy({handlers: false});
					inv_trans.open({open_empty: true});
					inv_trans.append();
					
					inv_trans.transaction_type.value = 1;
					inv_trans.product_id.value = item.product_id.value;
					inv_trans.purchase_order_id.value = item.owner.purchase_order_id.value;
					inv_trans.quantity.value = item.quantity.value;
					inv_trans.transaction_created_date.value = new Date();
					inv_trans.post();
					inv_trans.apply();
					item.warning('Product successfully posted to inventory!');
					item.cancel_edit();
			});
	}
	
	function on_edit_form_shown(item) {
		//new code
		item.inventory_id.read_only = true;
	
	
		if (item.owner.status_id.value == 1) {
			item.edit_form.find("#recive_po").hide();
			item.posted_to_inventory.read_only = true;
			item.date_received.read_only = true;
		}
		
		if (item.owner.status_id.value >= 2) {
			item.quantity.read_only = true;
			item.unit_cost.read_only = true;
			item.total_price.read_only = true;
			item.product_id.read_only = true;
		}
		
		if (item.owner.status_id.value == 1) {
			item.edit_form.find("#recive_po").hide();
		}
		
		if (item.posted_to_inventory.value === true) {
			item.edit_form.find("#recive_po").hide();
			item.posted_to_inventory.read_only = true;
			item.date_received.read_only = true;
		}
	}
	
	function on_field_select_value(field, lookup_item) {
		let item = field.owner;
		if (field.field_name === 'product_id' && lookup_item) {
			lookup_item.set_where({supplier_ids: item.owner.supplier_id.value});
		}
	}
	this.on_field_changed = on_field_changed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_view_form_created = on_view_form_created;
	this.recive_po = recive_po;
	this.create_inv_trans = create_inv_trans;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_field_select_value = on_field_select_value;
}

task.events.events39 = new Events39();

function Events41() { // northwind_traders.reports.inventory_list_jam 

	function on_before_print_report(report) {
		report.alert('Not yet implemented!');
	}
	this.on_before_print_report = on_before_print_report;
}

task.events.events41 = new Events41();

function Events42() { // northwind_traders.inventory_menu.inventory_list_datatables 

	function on_view_form_created(item) {
		item.paginate = false;
		item.table_options.new = false;
		if (!item.lookup_field) {	
			var purchase_btn = item.add_view_button('Purchase', {image: 'icon-pencil', btn_id:'purchase_btn'});
				purchase_btn.click(function() { 
					purchase(item);
				});
		}
		
		item.view_form.find("#new-btn, #edit-btn, #delete-btn").hide();
	}
	
	function on_after_open(item) {
		item.server('get_rows', function(data, error) {
				var table=$('#table_id').DataTable( {
					data: data,
					columns: [
								{data: 'product_id', title: 'product_id'},
								{data: 'product_name', title: 'product_name'},
								{data: 'quantity_on_back_order', title: 'quantity_on_back_order'},
								{data: 'quantity_purchased', title: 'quantity_purchased'},
								{data: 'quantity_on_hand', title: 'quantity_on_hand'},
								{data: 'quantity_sold', title: 'quantity_sold'},
								{data: 'quantity_on_hold', title: 'quantity_on_hold'},
								{data: 'quantity_on_order', title: 'quantity_on_order'},
								{data: 'target_level', title: 'target_level'}
							],
					columnDefs: [ {
						orderable: false,
						className: 'select-checkbox',
						targets:   0
					} ],
					// select: {
					//	 style:	'os',
					//	 selector: 'td:first-child'
					// },
					// order: [[ 0, 'asc' ]]
					select: {
						style: 'multi'
					}
				} );
				// console.table(data);
		});
		
	}
	this.on_view_form_created = on_view_form_created;
	this.on_after_open = on_after_open;
}

task.events.events42 = new Events42();

function Events43() { // northwind_traders.catalogs.mail 

	function on_edit_form_created(item) {
		item.edit_form.find('#ok-btn').text('Send email').off('click.task').on('click', function() {
			send_email_server(item);
		});
		item.edit_form.find('textarea.mess').height(120);
	}
	
	function send_email_server(item, email_address, subject, mess) {
		item.server('send_email_server', [item.email_address.value, item.subject.value, item.mess.value], 
			function(result, err) {
				if (err) {
					item.warning('Failed to send the mail: ' + err);
					item.edit();
				}
				else {
					item.warning('Successfully sent the mail');
					item.close_edit_form();
					item.delete();			
				}
			}
		);
	}
	this.on_edit_form_created = on_edit_form_created;
	this.send_email_server = send_email_server;
}

task.events.events43 = new Events43();

function Events44() { // northwind_traders.catalogs.home_page 

	function on_view_form_created(item) {
		
		//inventory open
		item.view_form.find("#inventory").on('click.task', function(e) {
			e.preventDefault();
			task.inventory_list.view(task.forms_container);
		});
		//orders open
		item.view_form.find("#orders").on('click.task', function(e) {
			e.preventDefault();
			task.orders.view(task.forms_container);
		});
		//customers open
		item.view_form.find("#customers").on('click.task', function(e) {
			e.preventDefault();
			task.customers.view(task.forms_container);
		});
		//purchase_orders open
		item.view_form.find("#purchase_orders").on('click.task', function(e) {
			e.preventDefault();
			task.purchase_orders.view(task.forms_container);
		});
		//suppliers open
		item.view_form.find("#suppliers").on('click.task', function(e) {
			e.preventDefault();
			task.suppliers.view(task.forms_container);
		});
		//employees open
		item.view_form.find("#employees").on('click.task', function(e) {
			e.preventDefault();
			task.employees.view(task.forms_container);
		});
		//shippers open
		item.view_form.find("#shippers").on('click.task', function(e) {
			e.preventDefault();
			task.shippers.view(task.forms_container);
		});
		//sales_reports open
		item.view_form.find("#sales_reports").on('click.task', function(e) {
			e.preventDefault();
			task.sales_reports.view(task.forms_container);
		});
		
		//reports open
		item.view_form.find("#app_instructions").on('click.task', function(e) {
			e.preventDefault();
			how_app_works_mess(item);
		});
		
		let active_orders = task.orders.copy();
			active_orders.set_where({employee_id: task.user_info.user_id, status_id__ne: 3});
			active_orders.set_order_by(['-order_date']);
			active_orders.table_options.height = 330;
			active_orders.paginate = false;
			active_orders.table_options.show_paginator = false;
			active_orders.table_options.fields = ['order_id', 'employee_id', 'order_date', 'customer_id', 'status_id'];
			active_orders.table_options.expand_selected_row = 2;
			active_orders.open();
			active_orders.create_table(item.view_form.find(".active_orders"));
			
		let inventory = task.inventory_list.copy();	
			inventory.table_options.height = 330;
			inventory.table_options.fields = ['id', 'product_name', 'quantity_on_hand', 'target_level'];
			inventory.table_options.expand_selected_row = 2;
			inventory.open();
			inventory.create_table(item.view_form.find(".inventory_to_reorder"));
	
		task.dashboard.show_orders(item, item.view_form.find('#orders-canvas').get(0).getContext('2d'));
		task.dashboard.show_categories(item, item.view_form.find('#categories-canvas').get(0).getContext('2d'));
		
	}
	
	function how_app_works_mess(item) {
		task.message(
			'<h5>Hi there!</h5>'+
			'   <p>This is the Northwind Traders v1 Application migrated from Access. Use Export to download the code and the database.'+
			'	   Then, install Jam.py, start New project and import the file, as described on Help.'+
			'	   Some of the Forms were left as Jam.py default view, ie. Customers, Suppliers, Shippers. Takes a minute to customise, all no code!</p><hr>'+
			'	   <b>Please remove the builder.html file after that to be able to access the Application Builder interface.</b>'+
			''+
			'   <p>Enjoy Jam.py!</p>',
				{title: 'App message...', margin: 0, text_center: false,
					buttons: {"OK": undefined}, center_buttons: true}
				);
	}
	this.on_view_form_created = on_view_form_created;
	this.how_app_works_mess = how_app_works_mess;
}

task.events.events44 = new Events44();

})(jQuery, task)