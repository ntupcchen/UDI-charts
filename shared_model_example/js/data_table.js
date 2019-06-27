/**************
for jqgrid search result
***************/
var oldFrom = $.jgrid.from;
var lastSelected;

$.jgrid.from = function (source, initalQuery) {
    var result = oldFrom.call(this, source, initalQuery),
        old_select = result.select;
    result.select = function (f) {
        lastSelected = old_select.call(this, f);
        return lastSelected;
    };
    return result;
};


$(document).on("data_start", function(event){	
	// 若本來存在data table 則先Reset
	// if($.fn.DataTable.isDataTable('#table_content'))
	// 	$('#table_content').DataTable().destroy();
	
	$('#table_content').html('');
	// $('#table_pager').html('');
	
	// showTable(share_model.data['data_category'], '', 0);
	showJQgrid(share_model.data['data_category'], '', 0);

});

$(document).on("data_edit", function(event, input){	
		
	$('#table_content').html('');

	// $('#table_pager').html('');	
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	showJQgrid(share_model.data['data_category'], '', 0);

});

$(document).on("data_filter", function(event, input){	
	
	// $('#table_data tr').removeClass('highlight');	
	// $('#table_content').DataTable().destroy();
	
	$('#table_content').html('');
	$('#table_pager').html('');
	
	// 得到條件後 利用sharedmodel提供的方法得到篩選結果
	var result_arr = share_model.getResult(input);	


	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	

	// 
	var state = share_model.state;
	
	if(state == true)
		showJQgrid(share_model.data['data_category'], result_arr, 1);
		// showTable(share_model.data['data_category'], result_arr, 1);
	else
		showJQgrid(share_model.data_tmp, result_arr, 0);
		// showTable(share_model.data_tmp, result_arr, 0);
});

$(document).on("data_highlight", function(event, input){	
	
	// $('#table_data tr').removeClass('highlight');	
	// $('#table_content').DataTable().destroy();
	
	$('#table_content').html('');
	$('#table_pager').html('');
	
	// 得到條件後 利用sharedmodel提供的方法得到篩選結果
	var result_arr = share_model.getResult(input);	


	// 
	var state = share_model.state;
	
	showJQgrid(share_model.data_tmp, result_arr, 0);	
});

$(document).on("data_cluster", function(event, input){	
	// 若本來存在data table 則先Reset
	
	// if($.fn.DataTable.isDataTable('#table_content'))
	// 	$('#table_content').DataTable().destroy();

	$('#table_content').html('');
	
	var result_arr = share_model.getResult(input);
	// console.log(result_arr);
	share_model.addColumn(input, result_arr);
	
	// showTable(share_model.data['data_category'], '', 0);
	showJQgrid(share_model.data['data_category'], '', 0);
});

// output the data to the table, mode=0: highlight, mode=1: filter
// function showTable (data, filters='', mode)
// {	
// 	var str = '';	
// 	// if do filter, adjust data_tmp
// 	if(mode == 1)
// 	{
// 		share_model.reset_data();
// 	}

// 	for(var i=1; i<data.length; i++)
// 	{
// 		if(i == 1) str += '<thead><tr>';
// 		else
// 		{
// 			var flag = false;
// 			// if filters is not empty
// 			for(var k=0; k<filters.length; k++){
// 				if(filters[k] == data[i].sID)
// 				{
// 					flag = true ;
// 					break;
// 				}
// 			}			
// 			if(flag == true) // print the match data
// 			{
				
// 				if(share_model.state == false)
// 					str += '<tr id="table_data'+i+'" class="highlight">';
// 				else
// 				{
// 					str += '<tr id="table_data'+i+'">';
					
// 					// edit data_tmp 符合條件的送入
// 					share_model.data_tmp.push(data[i]);
// 				}

// 				for(var key in data[i])
// 				{							
// 					if(key == 'sID') 
// 						continue;
// 					str += '<th>'+data[i][key]+'</th>';
// 				}				
				
// 			}
// 			// else if(flag == true && mode == 1) str += '<tr id="table_data'+i+'" class="highlight">';
// 			else if(mode == 0) 
// 			{
// 				str += '<tr id="table_data'+i+'">';
// 				for(var key in data[i])
// 				{							
// 					if(key == 'sID') 
// 						continue;
// 					str += '<th>'+data[i][key]+'</th>';
// 				}
// 			}
// 		}


// 		// for(var j=0; j<data[i].length; j++)
// 		// for(var key in data[i])
// 		// {							
// 		// 	str += '<th>'+data[i][key]+'</th>';
// 		// }
// 		if(i == 1) 
// 		{
// 			for(var key in data[i])
// 			{							
// 				if(key == 'sID') 
// 					continue;
// 				str += '<th>'+data[i][key]+'</th>';
// 			}
// 			str += '</tr></thead><tbody>';
// 		}
// 		str += '</tr>';
// 	}
// 	str += '</tbody>';

// 	$('#table_content').append(str);

// 	// data table (預設關掉sort)
// 	$('#table_content').DataTable({
// 		// "bSort": false,
// 		order:[],
// 		scrollX: true,
// 		scrollY: 500,
// 		// searching: false,
// 		language:{
// 			"processing":   "處理中...",
// 			"loadingRecords": "載入中...",
// 			"lengthMenu":   "顯示 _MENU_ 項結果",
// 			"zeroRecords":  "沒有符合的結果",
// 			"info":         "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
// 			"infoEmpty":    "顯示第 0 至 0 項結果，共 0 項",			
// 			"infoFiltered": "(從 _MAX_ 項結果中過濾)",
// 			"infoPostFix":  "",
// 			"search":       "搜尋:",
// 			"paginate": {
// 				"first":    "第一頁",
// 				"previous": "上一頁",
// 				"next":     "下一頁",
// 				"last":     "最後一頁"
// 			},
// 			"aria": {
// 				"sortAscending":  ": 升冪排列",
// 				"sortDescending": ": 降冪排列"
// 			}
// 		}
		
// 		// dom: '   Bfrtip',		
// 		// buttons:[
// 		// 	{
// 		// 		text: '重置資料',
// 		// 		action: function(e, dt, node, config){
// 		// 			$(document).trigger('data_start');
// 		// 		}
// 		// 	}
// 		// ]

//         // "scrollCollapse": true,
//         // "paging":false
// 	});

// 	var xx = $('#table_content').DataTable();
// 	xx.on('search.dt', function () {
// 		// consol。e.log(xx.rows( { filter : 'applied'} ).data());    	
// 	} );
	
// 	// use table row id to do highlight
// 	// $('#table_content tbody tr').on('click', function(e){
// 	// 	// $('#table_content tbody tr').removeClass();
// 	// 	$('#table_content tbody tr').addClass('highlight2');
// 	// 	console.log('ck')
// 	// });
	
// }

// output the data to the table, mode=0: highlight, mode=1: filter
var search_flag = false;
function showJQgrid(data, filters='', mode)
{	
	// reset
	$.jgrid.gridUnload('#table_content');

	// if do filter, adjust data_tmp
	if(mode == 1)
	{
		share_model.reset_data();
	}

	var w = $('#table_data').width();

	
	// 將data處理成jqgrid的input
	var colmodel = '[';
	var str;
	for(var key in data[1])
	{			
		// if(key == 'sID') continue;
		
		str = '{';
		
		str += '\"label\":'+'\"'+data[1][key]+'\" ,';
		str += '\"name\":'+'\"'+key+'\" ,';
		str += '\"index\":'+'\"'+key+'\" ,';
		if(key == 'sID'){
			str += '\"hidden\":'+'true, ';
			// str += '\"frozen\":'+'true, ';
		}
		// if(key == 'place') 
		// 	str += '\"frozen\":'+'true, ';
		
		str += '\"editable\":'+'true,';
		str += '\"search\":'+'true,';
		// str += '\"searchoptions\":'+'{\"clearSearch\": false},';
		// str += '\"searchrules\":'+'{\"custom\":true, \"custom_func\":\"mycheck\"},';
		if(key.startsWith('target'))
			str += '\"sorttype\":'+'\"int\"';
		else
			str += '\"sorttype\":'+'\"text\"';


		str += '},';
		
		colmodel += str;
	}
	colmodel = colmodel.substring(0,colmodel.length-1);
	colmodel += ']';
	
	colmodel = JSON.parse(colmodel);
	// console.log(colmodel)
	
	// 去掉隱藏的data(前兩row)
	var grid_data = $.extend(true, [], data);
	var table_data = [];
	grid_data.splice(0,1);
	grid_data.splice(0,1);

	// 處理符合條件的data
	var flag = true;
	for(var i=0; i<grid_data.length; i++)
	{
		flag = true;
		for(var j=0; j<filters.length; j++)
		{
			if(grid_data[i].sID == filters[j])
			{
				flag = false;
				break;
			}
		}
		if(mode == 1)
		{
			if(flag == false || filters.length == 0)
			{
				table_data.push(grid_data[i]);
				share_model.data_tmp.push(grid_data[i]);
		}
			}
		else if(mode == 0)
			table_data.push(grid_data[i]);
	}

	// for row selection when changing pages
	var table_id = [];
	function updateIndex(id, isSelected)
	{
		var page = $("#table_content").getGridParam('page');
		var perpage = $("#table_content").getGridParam('rowNum');
		if(typeof(share_model.data['data_category'][perpage*(page-1)+(parseInt(id)+1)]) != 'undefined')
		{
			var nid = parseInt(share_model.data['data_category'][perpage*(page-1)+(parseInt(id)+1)]['sID']);
			var index = $.inArray(nid, table_id);
			
			if(!isSelected && index >= 0)		
				table_id.splice(index, 1);		
			else if(index<0)
				table_id.push(nid);
		}
	}

	// create table
	var sid_arr = {}
	sid_arr['sID'] = [];
	$('#table_content').jqGrid({
		datatype: 'local',
		data: table_data,
		width: w*0.93,
		// height: w*0.23,
		height: '100%',

		colModel: colmodel,
		viewrecords: true,
		// caption: 'test grid',
		editurl: 'clientArray',
		pager: '#table_pager',
		rowNum: 10,
		rowList: [10,20,50,100],
		multiselect: true,
		shrinkToFit: false,
		autowidth: true,
		onSelectRow: updateIndex,
		onSelectAll: function(rowId, isSelected)
		{
			var id;
			
			for(var i=0; i<rowId.length; i++)
			{
				id = rowId[i];
				updateIndex(id, isSelected);
			}
		},

		// 對data上色
		loadComplete: function(data)
		{
			// var state = share_model.state;	
			var allrows = $('#table_content').jqGrid('getDataIDs');					
			// console.log($('#table_content').jqGrid('getGridParam','data'));
			var rowid, flag;

			// for highlight
			for(var i=0; i<allrows.length; i++)
			{
				flag = false;
				rowid = allrows[i];

				for(var j=0; j<filters.length; j++)
				{
					if(filters[j] == data.rows[i]['sID'])
					{
						flag = true;
						break;
					}
				}
				if(flag == true && mode == 0){					
					$('#table_content').jqGrid('setRowData', rowid, false, {color:'red'});
				}
				
			}

			// for row selection (appearance)
			for(var i=0; i<allrows.length; i++)
			{
				rowid = allrows[i];
				for(var j=0; j<table_id.length; j++)	
				{
					if(table_id[j] == data.rows[i]['sID'])
					{
						$('#table_content').jqGrid('setSelection', rowid, false);
					}
				}
				
			}

			// for search event
			if(search_flag == true)
			{
				search_flag = false;
				var search_data = data.rows;
				// this.p.lastSelected = lastSelected;
				// console.log(lastSelected);
				
				for(var i=0; i<lastSelected.length; i++)
				{
					sid_arr['sID'].push(Number(lastSelected[i].sID));
				}

				// [{source:type,val:send_array_type, type: 'equal', content: send_title}];
				var send_arr = [{source:'table', val: sid_arr, type: 'equal', content: sid_arr['sID']}];
				share_model.getFilterCondition(send_arr);
				// console.log(share_model.condition);
				
				// trigger search event
				$(document).trigger('data_search', share_model.condition);
				// $(document).trigger('data_search', send_arr);
				
			}
		}
	});
	// $('#table_content').jqGrid('setFrozenColumns');

	/*****
		add, delete, edit , search functions	
	*****/
	 
	function editContent(params, posdata)
	{
		// console.log(posdata);

		// share_model.editData(posdata);
						
		setTimeout(function(){
			$(document).trigger('data_edit', posdata);
		}, 50);
	}

	function doSearch(params)
	{
		// console.log($('#table_content').getGridParam("postData"));
		search_flag = true;		
	}


	// table grid
	$('#table_content').navGrid('#table_pager',
		{
			edit: true,
			add: true,
			del: true,
			view: true,
			search: true,
			refreshstate: 'current',
			refresh: false,			
			position: 'left',
			cloneToTop: false
			
		},
		// edit options
		{
			height: 'auto',
			closeAfterEdit: true,
			reloadAfterSubmit: true,
			onclickSubmit: editContent

		},
		// add options
		{
			height: 'auto',
			closeAfterAdd: true,
			reloadAfterSubmit: true,
			onclickSubmit: function(params, posdata)
			{

				var new_sid = parseInt(share_model.data['data_category'][share_model.data['data_category'].length-1]['sID'])+1;				
				var new_data = {};

				for(key in posdata)
				{
					
					for(key2 in share_model.data['data_category'][0])
					{
						if(key == key2)
						{
							if(key == 'sID')
								new_data[key] = new_sid.toString();
							else
								new_data[key] = posdata[key];

						}
					}
				}
				
				share_model.data['data_category'].push(new_data);
				
				
				setTimeout(function(){
					$(document).trigger('data_edit');	
				}, 50);
				
			}
		},
		// delete options
		{
			reloadAfterSubmit: true,
			onclickSubmit: function(params, posdata)
			{							
				var sid;						
				for(var i=0; i<table_id.length; i++)
				{
					sid = table_id[i];									
					for(var j=0; j<share_model.data['data_category'].length; j++)
					{
						if(sid == share_model.data['data_category'][j]['sID'])
						{
							share_model.data['data_category'].splice(j,1);
							break;
						}
					}
				}				
				
				// 
				setTimeout(function(){
					$(document).trigger('data_edit');	
				}, 50);
			}
		},
		// search options
		{
			sopt: ['cn','nc','eq','ne','lt','le','gt','ge'],
			closeAfterSearch: true,
			closeAfterReset: true,
			onSearch: doSearch,
			// onClose: doSearch,			
			// multipleSearch:true,
		}
	);

	$('#table_content').navButtonAdd('#table_pager',
		{
			caption: "",
			buttonicon: "glyphicon-plus-sign",
			title: "group",			
			position: "last",
			onClickButton : customButtonClicked
		}
	);

	

	function customButtonClicked()
	{
		
				
		var type = 'data_table';
		var send_array = [];
		var tmp_array = [];
		var data_type = 'sID';
		
		var str = '<div class="modal fade" id="groupModal" role="dialog">'+
			'<div class="modal-dialog">'+
				'<div class="modal-content">'+
					'<div class="modal-header">'+
						'<button type="button" class="close" data-dismiss="modal" onclick="groupModal_close(\'groupModal\')">X</button>'+
						'<h4 class="modal-title">自訂群集</h4>'+
					'</div>'+
					'<div class="modal-body">'+
						'<p>欄位名稱:<input type="text" id="group_name"></p>'+
						'<p>選項名稱:<input type="text" id="group_row_name"></p>'+
					'</div>'+
					'<div class="modal-footer">'+					
						'<button type="button" class="btn btn-default" data-dismiss="modal" id="groupModal_complete">complete</button>'+
						'<button type="button" class="btn btn-default" data-dismiss="modal" onclick="groupModal_close(\'groupModal\')">close</button>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>';
		$('#table_content').append(str);
		$('#groupModal').modal('show');

		// 送出自訂group by table icon
		$('#groupModal_complete').click(function()
		{
			var col_title = $('#group_name').val();
			var row_value = $('#group_row_name').val();
			// console.log(share_model.data['data_category']);
			for(var i=0; i<table_id.length; i++)
			{			
				tmp_array.push(share_model.data['data_category'][table_id[i]+1][data_type]);
			}
			send_array[data_type] = tmp_array;

			var result = [{source:type,val:send_array, title: row_value,type: 'equal', type2: col_title}];
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			// console.log('table: ');
			// console.log(result);
			$(document).trigger('data_cluster', result);
			
		});

		
	}

}

function groupModal_close(id)
{
	$("#"+id).on('hidden.bs.modal', function () {
		$(this).remove();
	});
}