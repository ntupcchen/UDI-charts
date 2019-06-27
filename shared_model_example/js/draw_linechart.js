$(document).on("data_start", function(event){
	// var input = share_model.data;	
	var post_result = share_model.post_classify(share_model.data['data_category']);
	
	// console.log(post_result);
	// chart_select(post_result['data']);
	line_category_select(post_result['data'])
});

$(document).on("data_edit", function(event, input){
	// var input = share_model.data;	
	share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	line_category_select(post_result['data'])
});

$(document).on("data_filter", function(event, input){
	// var input = share_model.data;	
	var state = share_model.state;
	var result_arr = share_model.getResult(input);

	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	

	if(state == true)
	{
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);	
		line_category_select(post_result['data'])
	}	
	else
		var post_result = share_model.post_classify(share_model.data_tmp);	
	
	
});
$(document).on("data_cluster", function(event, input){
	
	var result_arr = share_model.getResult(input);
	share_model.addColumn(input, result_arr);
	var post_result = share_model.post_classify(share_model.data['data_category']);		
	line_category_select(post_result['data'])
});
function line_category_select(input)
{	
	$('#div_compare').html('');
	$('#chart_div').html("<canvas id='chart_line'></canvas>");
	
	
	
	var string_tmp = '<option value="" selected disabled>選項</option>';
	for(key in input)
	{
		if(key == 'sID' || key == 'ID')
			continue;
		// if(key == 'place')
		// 	string += '<option value="'+key+'" selected>';
		// else
		string_tmp += '<option value="'+key+'">';
		string_tmp += share_model.data['data_category'][1][key];
		string_tmp += '</option>';
	}

	var string = '<div id="compare_header"><h4>比較模式：</h4>';
	// string += '<h5>分類依據：<div style="float:right">共 '+input['sID'].length+' 筆</div><select id = "chart_option">';
	string += '<h5>X軸：<select id="option_x" style="margin:5px">';
	string += string_tmp;
	string += '</select>';
	string += 'Y軸：<select id="option_y" style="margin:5px">';
	string += string_tmp;
	string += '</select>';

	string += '<button class="btn btn-primary " id="compare_button" style="margin-left: 10px">確定</button></h5>';
		
	string += '</div>';

	
	$('#div_compare').append(string);
	$('#compare').show();

	$('#compare_button').on('click', function(){
		var x_name = $('#option_x').val();
		var y_name = $('#option_y').val();
		if(x_name != y_name && x_name != null && y_name != null)
			draw_line(input, x_name, y_name);
		else
			alert('兩者選項不能相同！');
	})
	
}
function is_numeric(input)
{
	var flag = true;
	for(var i=0; i<input.length; i++)
	{
		if(!$.isNumeric(input[i].name))
		{
			flag = false;
			break;
		}
	}	
	return flag;
}

function arr_add(input, index)
{
	var arr = [];
	if(is_numeric(input[index]) == true)
	{
		for (var i=0; i<input[index].length; i++) 
		{
			arr.push(Number(input[index][i].name));			
		}
		arr.sort(function(a,b){
			return a-b;
		})
	}
	else
	{
		for (var i=0; i<input[index].length; i++) 
		{
			arr.push(input[index][i].name);
		}
	}

	return arr;
}
function draw_line(input, x_name, y_name)
{		
	// console.log(input)
	// console.log(share_model.data['data_category'])
	
	// 抓x_name = y_name的狀況
	
	// 判斷是否為數值型態
	var x_arr = [];
	var y_arr = [];

	x_arr = arr_add(input, x_name)
	y_arr = arr_add(input, y_name)
	

	// 抓符合x_name y_name的值
	var data_count = [];
	var x_data = [];
	var y_data = [];
	var share_model_data = share_model.data['data_category'];
	var x_data;
	var y_data;
	var flag = 0;
	
	// 扣掉首行自訂的，符合兩者的資料
	for(var i=1; i<share_model_data.length; i++)
	{
		flag = 0;
		x_data = '';
		y_data = '';
		for(var key in share_model_data[i])
		{
			if(key == x_name)
			{
				for(var j=0; j<x_arr.length; j++)
				{
					if(share_model_data[i][key] == x_arr[j])
					{
						flag++;
						x_data = x_arr[j];
						break;
					}
					
				}
			}
			// if(flag == 0) break;
			else if(key == y_name)
			{
				for(var j=0; j<y_arr.length; j++)
				{
					if(share_model_data[i][key] == y_arr[j])
					{
						flag++;
						y_data = y_arr[j];
						break;
					}
					
				}
			}			

		}
		if(flag == 2)
		{
			data_count.push([x_data, y_data]);				
		}
	}

	
	// 整理並分類(group)
	var num_count = data_count.reduce(function(result, name){
		if(name in result){
			result[name]++;
		}
		else{
			result[name]=1;
		}
		return result;
	}, {});
		

	// 
	var data_arr = [];
	for(var key in num_count)
	{
		// data_arr.push([key.split(',')[0],key.split(',')[1],num_count[key]]);
		if(typeof(data_arr[key.split(',')[1]]) == 'undefined')
		{
			data_arr[key.split(',')[1]] = [];
		}
				
		data_arr[key.split(',')[1]][key.split(',')[0]] = num_count[key];
		
	}	

	var data_set = [];
	var y_tmp = [];	
	for(var i=0; i<y_arr.length; i++)
	{
		// data_set[i] = [];
		for(var key in data_arr)
		{
			y_tmp = [];
			if(y_arr[i] == key)
			{
				
				for(var j=0; j<x_arr.length; j++)
				{
					// data_arr[key][y_arr[j]];
					if(typeof(data_arr[key][x_arr[j]]) == 'undefined')
						data_arr[key][x_arr[j]] = 0;	
					y_tmp.push(data_arr[key][x_arr[j]]);
					
				}
				data_set[i] = y_tmp;
			}
		}

	}
	// console.log(data_set)

	// chart dataset setting
	var dataset_arr = [];
	var colorArray = ['red', 'green', 'blue', 'black', 'yellow', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
	for(var i=0; i<y_arr.length; i++)
	{
		dataset_arr[i] = {};
		dataset_arr[i].label = y_arr[i];
		dataset_arr[i].data = data_set[i];
		dataset_arr[i].fill = false;
		dataset_arr[i].borderColor = colorArray[i];
		dataset_arr[i].lineTension = 0.1

	}
	console.log(x_arr)
	console.log(dataset_arr)

	var ctx = document.getElementById("chart_line").getContext('2d');
	var myLineChart = new Chart(ctx, {
		"type":"line",
		"data":{
			// "labels":["January","February","March","April","May","June","July"],
			"labels":x_arr,
			"datasets": dataset_arr	   		
		},
		"options":{
			maintainAspectRatio: false
		}
	});
	
	
}