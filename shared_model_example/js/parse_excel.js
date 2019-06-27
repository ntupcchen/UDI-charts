
// true: readAsBinaryString ; false: readAsArrayBuffer
var rABS = false;
var upload_data;
var load_flag = 0;
// file upload
$(document).ready(function()
{
	$("#upload").click(function(){
		$("#file_upload").click();
	});

	

	
// parse content and get sheet name and first row(ID)
	$('#sheet_name').change(function(input)
		{			
			
			$('#reset_div').show();
			$('#sync_mode').show();
			$('#map').show();			
			$('#mode_toggle').bootstrapToggle('on');
			$('#search_condition').show();
			// $('#uploadDocuSky').show();
			
			$.blockUI({ message: '<div>讀取中 !</div>'});
			

			var input = $('#sheet_name').val()
			var worksheet, desired_cell, desired_value;	

			var workbook = XLSX.read(upload_data, {type: rABS ? 'binary' : 'array'});	
			var first_sheet_name = input;
			sheet_name = input;
			var data_headers = [];	
			
			
			/* Get worksheet */
			worksheet = workbook.Sheets[first_sheet_name];

			var data_content = XLSX.utils.sheet_to_json(worksheet, {header:1, defval:''});
			
			for(var i=0; i<data_content[0].length;i++)
			{
				data_headers.push(data_content[0][i]);
			}

			/* Get the range */
			// var C, range = XLSX.utils.decode_range(worksheet['!ref']);
			

			// let the model process upload_data and trigger the action
			var data_result = share_model.getInput(data_content, data_headers);
			
			// delay 1 sec for block msg (temp)
			setTimeout(function(){
				$(document).trigger('data_start');
				$.unblockUI();
			}, 1000);
			
			// $(document).trigger('data_start');
			
			// $('#loading').toggle();
			// $('#all').block({ message: '<div>讀取中 !</div>'});
			// $('#all').unblock();
		}
	);	

});

function file_upload(input)
{
	
	// function upload()
	var data_content, json_for_graphic;
	var data_headers = [];
	var file = input.files[0];
	var reader = new FileReader();
	var sheet_str = '<option value="" selected disabled>表單</option>';
	
	reader.fileName = file.name;
	var fileType = reader.fileName.split('.')[1];
	document_name = reader.fileName.split('.')[0];
	reader.onload = function(event)
	{
		upload_data = event.target.result;	
				
		// 讀json檔
		if(fileType == 'json')
		{
			var jsondoc = JSON.parse(upload_data);
			json_for_graphic = jsondoc;
			data_content = [];
			data_headers = [];

			data_content[0] = []
			for(key in jsondoc[0])
			{
				data_headers.push(key);
				data_content[0].push(key);
			}

			for(var i=1; i<jsondoc.length; i++)
			{
				data_content[i] = [];
				for(key in jsondoc[i])
					data_content[i].push(jsondoc[i][key]);
			}
			// console.log(data_content);
			var data_result = share_model.getInput(data_content, data_headers);			
			$(document).trigger('data_start',data_result);
		}
		// 讀excel檔
		else
		{
			if(!rABS) upload_data = new Uint8Array(upload_data);
			var workbook = XLSX.read(upload_data, {type: rABS ? 'binary' : 'array', bookSheets: true});

			/* do sth with workbook*/
			
			
			for(var i=0; i<workbook.SheetNames.length; i++)
			{
				sheet_str += '<option value=\''+workbook.SheetNames[i]+'\' >';
				sheet_str += workbook.SheetNames[i];
				sheet_str += '</option>';
			}
			
			$('#sheet_name').html('');
			$('#sheet_name').append(sheet_str);
			$('#div_sheet').show();	
				
		}
		// var first_sheet_name = workbook.SheetNames[0];
		// var address_of_cell = 'A1';

		/* Get worksheet */
		// var worksheet = workbook.Sheets[first_sheet_name];

		/* Find desired cell */
		// var desired_cell = worksheet[address_of_cell];

		/* Get the value */
		// var desired_value = (desired_cell ? desired_cell.v : undefined);

				
	};

	if(fileType == 'json')
		reader.readAsText(file)
	else if(rABS) 
		reader.readAsBinaryString(file);
	else 
		reader.readAsArrayBuffer(file);

	resetAll();
}

function resetAll()
{
	/*****
		 reset everything
	******/
				
	// reset table
	// if($.fn.DataTable.isDataTable('#table_content'))
	// 	$('#table_content').DataTable().destroy();
	$.jgrid.gridUnload('#table_content');
	$('#table_content').html('');

	// reset post_classify component
	$('#component_post_classify').html('');

	// reset chart
	$('#chart_header').remove();
	echarts.dispose(document.getElementById('myChart'));

	// reset map
	$('#map').html('');

	// reset slider
	$('#compare').hide();
	$('#slider_header').remove();
	$('#slider_range').html('');

	// reset bar
	$('#bar_header').remove();
	$('#barChart').html('');
	// reset timeline
	// $('#timeline_header').remove();			
	// $('#myTimeline').html('');
	// $('#slideBar').html('');
	// loadflag = 0;

	// reset chartjs
	// $('#div_compare').html('');
	// $('#chart_div').html("<canvas id='chart_line'></canvas>");
	// echarts.dispose(document.getElementById('myTimeline'));
			

	$('#reset_div').hide();
	$('#sync_mode').hide();
	$("#search_condition").hide();
}