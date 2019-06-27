$(document).ready(function(){
	// hide file upload
	$("#file_upload").hide();
	// reset data	
	$('#reset_button').click(function(input){
				
		share_model.condition = [];
		share_model.condition_filter = [];
		// share_model.condition_manager = [];
		share_model.time_arr = []
		share_model.data_tmp = share_model.data.data_category;
		$(document).trigger('data_start');
	});

	$('#reset_condition_button').click(function()
	{
		share_model.condition_manager = [];
		$(document).trigger('data_start');
	});

	// mode button
	$('#mode_toggle').bootstrapToggle({
		on: 'filter',
		off: 'highlight',
		width: '50%'
	});

	$('#mode_toggle').change(function(input){
		share_model.state = $('#mode_toggle').prop('checked');
	});
	
	// $('[data-toggle="tooltip"]').tooltip(); 	

	// download content to excel from table
	$('#downloadToExcel').click(function(e){
		$('#table_content').jqGrid("exportToExcel", {
			includeLabels:true,
			// includeGroupHeader: true,
			// includeFooter: true,
			fileName: "jqGridTest.xlsx",
			// maxlength: 40
		})
	});
}
);

function refresh()
{
	if(confirm('確定要重新整理頁面？'))
		window.location.reload();
}

