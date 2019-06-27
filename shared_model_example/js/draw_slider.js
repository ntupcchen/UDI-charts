$(document).on("data_start", function(event){	
	var post_result = share_model.post_classify(share_model.data['data_category']);
	show_slider(post_result['data']);
});

$(document).on("data_edit", function(event, input){	
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	show_slider(post_result['data']);
});

$(document).on("data_filter", function(event, input){		
	var state = share_model.state;
	var result_arr = share_model.getResult(input);
	if(state == true)
	{
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);
		show_slider(post_result['data']);	
	}
	
});

$(document).on("data_cluster", function(event, input){
	var result_arr = share_model.getResult(input);
	share_model.addColumn(input, result_arr);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	show_slider(post_result['data']);
});

function show_slider(input)
{
	$('#compare').show();
	$('#slider_header').remove();

	/*
		for select option (numeric only)	
	*/	
	var string = '<h5 id ="slider_header">';
	string += '分類依據: <select id= "slider_option" style ="margin:5px">';
	var x=0;
	var type;
	var type_flag = 0;
	var key_flag = 0;
	
	for(key in input)
	{
		// 只吃target tag開頭 or sum or count
		if(!key.startsWith('target') && key != 'sum' && key != 'count')
			continue;

		// column data為numeric時才加入option
		for(var k=2; k<share_model.data['data_category'].length; k++)
		{
			// console.log(share_model.data['data_category'][k][key]);
			if($.isNumeric(share_model.data['data_category'][k][key]))
				type_flag = 1;
			else
				type_flag = 0;
		}
		if(type_flag == 1)	// 設定一開始的選項
		{		
			if(key_flag == 0)
			{
				string += '<option value="'+key+'" selected>';
				type = key;					
				key_flag = 1;
			}
			else
				string += '<option value="'+key+'">';
		}


		string += share_model.data['data_category'][1][key];
		string += '</option>';
	}	
	string += '</select>';
	string += '</h5>';
	if(key_flag == 0)
		return;
	$('#slider_range').before(string);

	/*
		for slider setting
	*/
	slide_init(input, type);
	
	$('#slider_option').change(function(){
		slide_init(input, this.value);	
	});
		
}

function slide_init(input, type)
{
	// console.log(input[type]);
	$('#slider_range').html('');
	// find min, max
	var min,max;

	min = Number(input[type][0].content);
	max = Number(input[type][0].content);
	for(var i=0; i<input[type].length; i++)
	{
		if(Number(input[type][i].content) > max)
			max = Number(input[type][i].content);
		else if(Number(input[type][i].content) < min)
			min = Number(input[type][i].content);
	}

	$('#amount').val((min).toFixed(0)+'-'+(max).toFixed(0));

	var start, end;
	$('#slider_range').slider({
		range:true,
		min: min,
		max: max,
		values:[(min).toFixed(0),(max).toFixed(0)],
		slide: function(event, ui)
		{
			start = ui.values[0];
			end = ui.values[1];
			$('#amount').val(start+'-'+end);
		},
		stop: function(event, ui)
		{
			start = ui.values[0];
			end = ui.values[1];
			// trigger event
			var value = {};
			value[type] = [];
			value[type].push(start);
			value[type].push(end);

			var result = [{source: 'slider_bar', val: value, type: 'range', content: value}];
			share_model.getFilterCondition(result);
			share_model.condition[0].type = 'range';
			
			console.log(share_model.condition);

			if(typeof(start) != 'undefined' && typeof(end) != 'undefined' ){				
				$(document).trigger('data_filter', share_model.condition);
			}
		}
	});
}