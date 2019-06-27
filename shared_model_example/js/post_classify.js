$(document).on("data_start", function(event){
	
	var post_result = share_model.post_classify(share_model.data['data_category']);
	// console.log(share_model.data['data_category'])
	// console.log(post_result)
	showClassification(post_result);

});

$(document).on("data_edit", function(event, input){
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);

	showClassification(post_result);

});

$(document).on("data_filter", function(event, input){

	var state = share_model.state;

	var result_arr = share_model.getResult(input);

	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	
	console.log(share_model.data['data_category']);

	if(state == true)
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);
	else
		var post_result = share_model.post_classify(share_model.data_tmp);
	
	showClassification(post_result);
	
});

$(document).on("data_cluster", function(event, input){
	
	// var state = share_model.state;
	var result_arr = share_model.getResult(input);	
	share_model.addColumn(input, result_arr);
	
	var post_result = share_model.post_classify(share_model.data['data_category']);
	showClassification(post_result);
});

$(document).on("data_search", function(event, input){
	
	var result_arr = share_model.getResult(input);

	var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);
	showClassification(post_result);
});

// functions
function showClassification(input)
{				
	
	$('#component_post_classify').html('');
	

	var header_index = 0;	
	var data = input['data'];
	// console.log(data);
	var str_header = '<h4>後分類：<div style="float:right">共 '+data['sID'].length+' 筆</div></h4>';
	$('#component_post_classify').append(str_header);
	console.log(input);
	console.log(data);
	for(var key in data)
	{	
		// 純數值資料不做後分類
		if(key == 'sID' || key == 'ID' ) {
			header_index++;
			continue;	
		}

		var str = '';
		str += '<div id="label_'+key+'">';		
		
		str += '<li >'+input['header'][header_index];
		str +=		'<ol>';
		for(var index in data[key])
		{			
			str += '<li id="'+key+'" data-name="'+data[key][index]['name']+'" data-value="'+data[key][index]['name']+'">';
			str += data[key][index]['name']+'  ('+data[key][index]['value']+')';			
			str += '</li>';
		}
		
		str +=		'</ol>';
		str += '</li>';
		str += '</div>';


		$('#component_post_classify').append(str);

		// treeview
		$('#label_'+key).bonsai({
			expandAll:false,
			checkboxes:true,
			createInputs:'checkbox'
		});

		header_index++;
	}
	
	var button = '<div class="btn-group">';
	button += 		'<button type="button" class="btn btn-danger"  id="btn_showModal" data-toggle="modal" data-target="#optionModal" data-backdrop="static" data-keyboard="false">新增選項</button>&nbsp&nbsp';
	button += 		'<button type="button" class="btn btn-primary" id="btn_post" style="margin-left:5px">執行</button>';
	// button += 		'<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
	// button += 			'<span class="caret"></span>';
	// button += 			'<span class="sr-only">Toggle Dropdown</span>';
	// button += 		'</button>';
	// button +=		'<ul class="dropdown-menu">';
	// button +=			'<li><a href="#" id="btn_not_post">NOT 篩選</a></li>';
	// button += 		'</ul>';
	button += 	'</div>';


	$("#component_post_classify").append(button);
	$("#search_condition").show();
	
	// click & show modal
	$("#btn_showModal").click(function(){
		showOptionModal(input);
	});

	$("#btn_post").click(function(){
		post_exec(input, 0);
	});

	$("#btn_not_post").click(function(){
		post_exec(input, 1);
	});
}

function showOptionModal(data)
{		
	var str_option = '';
	var count = 0;
	for(var key in data['data'])
	{
		if(key == 'sID' || key == 'ID' ) {
			count++;
			continue;
		}

		str_option += '<p><div><input type = "radio" name="option_group" value="'+key+'"> '+data['header'][count++]+'</div></p>';				
	}	
	var str = '<div class="modal fade" id="optionModal" role="dialog">'+
		'<div class="modal-dialog">'+
			'<div class="modal-content">'+
				'<div class="modal-header">'+
					'<button type="button" class="close" data-dismiss="modal">X</button>'+
					'<h4 class="modal-title">種類</h4>					'+
				'</div>'+
				'<div class="modal-body">'+
					'<p id="">選取欲新增的種類:</p>'+ str_option +
				'</div>'+
				'<div class="modal-footer">'+
					// '<button type="button" class="btn btn-default" data-toggle="modal" data-target="#optionModal_next">next</button>'+
					'<button type="button" class="btn btn-default" id="btn_showModalNext" data-toggle="modal" data-target="#optionModal_next" data-backdrop="static" data-keyboard="false">next</button>'+
					'<button type="button" class="btn btn-default" data-dismiss="modal" id="btn_closeModal">close</button>'+
				'</div>'+
			'</div>'+
		'</div>'+	
	'</div>';
	$('#component_post_classify').append(str);

	// click & show modal
	$("#btn_showModalNext").click(function(){
		var val = $('input[name="option_group"]:checked').val();
		
		var header_num = find_index_for_header(val, data);
		// console.log(header_num);
		if(typeof(val) !== 'undefined')
			showGroupOptionModal(val, data, header_num);
		else
			alert('請勾選種類');
	});

	$("#btn_closeModal").click(function(){
		optionModal_close('optionModal');
	})

}

function find_index_for_header(val, data)
{
	var index = 0 ;
	for(var key in data['data'])
	{		
		if(val == key)
			break;
		else
			index++;
	}
	return index;
}

function showGroupOptionModal(category, data, header_num)
{
	// console.log(category);
	var content = '';
	for(var key in data['data'][category])
	{
		// content.push(data[key].name)		
		content += '<p><div><input type = "checkbox" name="option_checkbox" value="'+data['data'][category][key].name+'"> '+data['data'][category][key].name+'</div></p>';
	}
	var str = '<div class="modal fade" id="optionModal_next" role="dialog">'+
		'<div class="modal-dialog">'+
			'<div class="modal-content">'+
				'<div class="modal-header">'+
					'<button type="button" class="close" data-dismiss="modal" onclick="optionModal_close(\'optionModal_next\')">X</button>'+
					'<h4 class="modal-title">選項內容</h4>'+
				'</div>'+
				'<div class="modal-body">'+
					'<p>選項名稱:<input type="text" id="option_name"></p>'+
					'<p>選取欲新增的選項:</p>'+ content +
				'</div>'+
				'<div class="modal-footer">'+					
					'<button type="button" class="btn btn-default" data-dismiss="modal" id="optionModal_complete">complete</button>'+
					'<button type="button" class="btn btn-default" data-dismiss="modal" onclick="optionModal_close(\'optionModal_next\')">close</button>'+
				'</div>'+
			'</div>'+
		'</div>'+
	'</div>';
	$('#component_post_classify').append(str);

	$('#optionModal_complete').click(function(){
		var title = $('#option_name').val();
		var val = [];
		var len = 0;
		var sum = 0;

		$('input:checkbox:checked[name="option_checkbox"]').each(function(i){
			// need to adjust to content
			len++;
			// console.log(this.value);
			// console.log(data['data'][category]);
			for(key in data['data'][category])
			{
				if(this.value == data['data'][category][key].name)
				{
					var tmp = data['data'][category][key].content;
					var sum_tmp = data['data'][category][key].value;
					var str_tmp = tmp.split(',');
					// console.log('cont = '+str_tmp.length);
					for (var i = 0; i < str_tmp.length; i++) {
						if(!val.includes(str_tmp[i]))
						{
							val.push(str_tmp[i]);
							sum += sum_tmp;
						}
					}

					break;
				}
			}
			// val.push(this.value);
			
		})
		
		if(title == '')
		{
			alert('請輸入標題');
			optionModal_close('optionModal_next');
		}
		else if(len == 0) 
		{			
			alert('請勾選選項');
			optionModal_close('optionModal_next');
		}
		else if(len == 1){			
			alert('請勾選超過一個選項');
			optionModal_close('optionModal_next');
		}
		else
		{
			// console.log('category='+category+' title='+title+' value='+val);
			
			// var str = '{"name":"'+title+'", "value":'+sum+', "content":"'+val+'"}';			
			// var new_title = 'user_defined_'+category;
			// var new_header = '使用者自訂_'+category;

			var type = 'post_classification';
			var send_array = [];
			send_array[category] = val;

			var result = [{source:type,val:send_array, title: title, type: 'equal'}];
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			// console.log('post_classification:');
			// console.log(result);
			$(document).trigger('data_cluster', result);

			// data['data'][new_title].push(JSON.parse(str.replace(/\r\n/g,"")));			
			

			// // judge if header exists
			// var header_flag = 0;
			// for(var i=0; i<data['header'].length; i++)
			// {
			// 	if(data['header'][i] == new_header)
			// 	{
			// 		header_flag = 1;
			// 		break;
			// 	}
			// }
			// if(header_flag == 0) 
			// {
			// 	data['header'].push('使用者自訂_'+data['header'][header_num]);
			// }


			// console.log(data);

			
		}

		
	});
}

function optionModal_close(id)
{
	$("#"+id).on('hidden.bs.modal', function () {
		$(this).remove();
	});
}

// execution post classify
function post_exec(data, mode)
{
	var val,id;
	var type = 'post_classification'
	var send_array = [];
	var send_array_type = [];	
	var send_title = [];
	var tmp_arr = [];
	
	// get all checkbox value

	// initialize
	$("ol.bonsai input:checkbox:checked").each(function(){
		console.log(this);
			val = $(this).val();
			id = $(this).parent().attr('id');
			if(send_array_type.indexOf(id) < 0){
				send_array_type[id] = [];
				tmp_arr[id] = []
			}
			// console.log(val);
			// save cell content
			send_title.push(val);
	});
	

	$("ol.bonsai input:checkbox:checked").each(function(){
			// console.log($(this).val())
			// console.log($(this).parent().attr('id'))
			val = $(this).val();
									
			id = $(this).parent().attr('id');
			
			// console.log(data['data']);
			// 			
			var data_tmp, content_split;
			for(index in send_array_type)
			{
				if(id == index)
				{					
					for(var i=0; i<data['data'][id].length; i++)
					{
						data_tmp = data['data'][id][i]; 
						if(val == data_tmp.name)
						{
							content_split = data_tmp.content.split(',');
							for(var j=0; j<content_split.length; j++)
							{
								if(!send_array_type[index].includes(content_split[j]))
								{
									send_array_type[index].push(content_split[j]);
									// $("#condition").append(val+',');
								}
							}	
						}
					}			
				}
			}			

	});
	var judge = 0;

	// do 'not filter' mode(have bugs in filter content)
	// if(mode == 1)
	// {				
	// 	for(index in send_array_type)
	// 	{						
	// 		for(var i=0; i<data['data'][index].length; i++)
	// 		{
	// 			judge = 0;
	// 			for(var j=0; j<send_array_type[index].length; j++)
	// 			{
	// 				if(data['data'][index][i].name == send_array_type[index][j])
	// 				{
	// 					judge = 1;
	// 					break;
	// 				}								
	// 			}					
	// 			if(judge == 0)
	// 			{
					
	// 				if(!tmp_arr[index].includes(data['data'][index][i].name))
	// 					tmp_arr[index].push(data['data'][index][i].name)
	// 			}
				
	// 		}			
			
	// 	}
		
	// 	send_array_type = tmp_arr;
	// }
	var result = [{source:type,val:send_array_type, type: 'equal', content: send_title}];

		
	// console.log(share_model.condition_manager);
	if(share_model.state == 1){
		share_model.getFilterCondition(result);
		console.log(share_model.condition);
		$(document).trigger('data_filter', share_model.condition);
	}
	else
	{
		var len=0;
		for(key in result[0].val)
		{
			len++;
		}
		if(len>1)
			alert('一次只能強調一次種類！');
		else{
			share_model.getFilterCondition(result);
			$(document).trigger('data_filter', share_model.condition);
		}
	}

	
	

}
