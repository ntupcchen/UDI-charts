$(document).on("data_start", function(event){
	// var input = share_model.data;	
	var post_result = share_model.post_classify(share_model.data['data_category']);
	
	// console.log(post_result);
	// chart_select(post_result['data']);
	chart_select_num(post_result['data']);
	
});

$(document).on("data_edit", function(event, input){
	// check state first
	var lock = share_model.checkState();
	if(lock == true) return;
	
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	
	// chart_select(post_result['data']);
	chart_select_num(post_result['data']);
});

$(document).on("data_filter", function(event, input){
	
	// check state first
	var lock = share_model.checkState();
	if(lock == true) return;

	var state = share_model.state;
	var result_arr = share_model.getResult(input);

	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	

	if(state == true)
	{
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);	
		// chart_select(post_result['data']);
		chart_select_num(post_result['data']);
	}	
	// else
		// var post_result = share_model.post_classify(share_model.data_tmp);	
	
});

$(document).on("data_cluster", function(event, input){
	
	var result_arr = share_model.getResult(input);
	share_model.addColumn(input, result_arr);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	// chart_select(post_result['data']);
	chart_select_num(post_result['data']);
});

$(document).on("data_search", function(event, input){
	var result_arr = share_model.getResult(input);
	var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);	
	chart_select_num(post_result['data']);
});


function chart_select(input)
{
	
	$('#chart_header').remove();
	var string = '<div id="chart_header"><h4>結果分布圖(餅圖)：</h4>';
	string += '<h5>分類依據：<div style="float:right">共 '+input['sID'].length+' 筆</div><select id = "chart_option">';
	var x=0;
	var type = '';
	for(key in input)
	{
			
		if(key == 'sID' || key == 'ID')
			continue;
		// if(key == 'place')
		// 	string += '<option value="'+key+'" selected>';
		// else
		// 	string += '<option value="'+key+'">';
		
		if(x==0)
		{
			string += '<option value="'+key+'" selected>';
			type = key;
			x++;
		}
		else
			string += '<option value="'+key+'">';

		string += share_model.data['data_category'][1][key];
		string += '</option>';
	}
	
	string += '</select></h5></div>';
	$('#myChart').before(string);
	
	draw_chart_num(input, type);

	$("#chart_option").change(function(){
		// console.log(this.value);
		draw_chart_num(input, this.value);
	});
}
function chart_select_num(input)
{
	// console.log(input);
	// return
	$('#chart_header').remove();
	var string = '<div id="chart_header"><h4><i class="fas fa-unlock" id="unlock_doughnut"></i>結果分布圖(餅圖)：</h4>';
	/*****
		title option 標題
	*****/	
	var x=0;
	var base;
	string += '<h5>標題：<select id = "title_option">';
	for(key in input)
	{
		if(key == 'ID' || key == 'sID') 
			continue;
		if(x==0)
		{
			string += '<option value="'+key+'" selected>';
			x++;
			base = key;
		}
		else
			string += '<option value="'+key+'">';

		string += share_model.data['data_category'][1][key];
		string += '</option>';
	}
	string += '</select> &nbsp&nbsp';

	/*****
		chart option 分類依據
	*****/
	string += '分類依據：<select id = "chart_option">';
	x=0;
	var type;
	var type_flag = 0;
	var key_flag = 0;
	var chart_flag = 0;
	
	for(key in input)
	{
		// 只吃target tag開頭 or sum or count
		if(!key.startsWith('target') && key != 'sum' && key != 'count')
			continue;

		// column data為numeric時才加入option
		for(var k=2; k<share_model.data['data_category'].length; k++)
		{			
			if($.isNumeric(share_model.data['data_category'][k][key]))
				type_flag = 1;
			else
				type_flag = 0;
		}
		if(type_flag == 1)	// 設定一開始的選項
		{
			chart_flag = 1;
			if(key_flag == 0)
			{
				string += '<option value="'+key+'" selected>';
				type = key;					
				key_flag = 1;
			}
			else
				string += '<option value="'+key+'">';
		}
		else
			return;

		string += share_model.data['data_category'][1][key];
		string += '</option>';
	}
	
	string += '</select>'; // close chart option
	string += '<button class="btn btn-primary" id="chart_button" style="margin-left:5px">執行</button>';
	string += '</h5></div>';
	if(chart_flag == 1)
		$('#myChart').before(string);
	else
		return;

	draw_chart_num(base, input, type);
	// chartjs(base, input, type);

	$('#chart_button').click(function(){
		base = $('#title_option').val();
		type = $('#chart_option').val();
		draw_chart_num(base, input, type);
		// chartjs(base, input, type);
	});

	// lock icon
	$('#unlock_doughnut').click(function()
	{
		$('#unlock_doughnut').toggleClass('fa-unlock fa-lock');
	})

	// $("#chart_option").change(function(){
	// 	// console.log(this.value);
	// 	draw_chart_num(base, input, this.value);
	// });
}

/***************************
e-chart: metadata version
***************************/
function draw_chart(input, type)
{
	// console.log(type);
	echarts.dispose(document.getElementById('myChart'));

	var draw_title = [];
	var draw_index = [];
	var sum = 0;
	for(key in input[type])
	{
		draw_title.push(input[type][key].name);
		draw_index.push(key);
		sum += input[type][key].value;
	}
	
	var draw_input = [];
	draw_input = input[type];
	for(key in draw_input)
	{
		// console.log(draw_input[key].name.split('(').length)
		if(draw_input[key].name.split('(').length <= 1)
			draw_input[key].name = draw_input[key].name + '('+draw_input[key].value+'/'+sum+')';
	}

	// draw chart
	var myChart = echarts.init(document.getElementById('myChart'));
	
	var option = {
		tooltip:
		{
			trigger: 'item',
			formatter: "{b}: {c} ({d}%)"
		},
		pieToggleSelect:
		{
			type: 'pieselectchanged',
			seriesIndex: draw_title,
			dataIndex: draw_index
		},
		legend:
		{
			// height: '500px',
			// orient: 'horizontal',
			// y:'top',
			// data: draw_title
		},
		series:
		[
			{
				name: '',
				type: 'pie',
				radius: ['50%', '80%'],
				avoidLabelOverlap: false,
				label:
				{
					normal:
					{
						show:false,
						position:'center'
					},
					emphasis:
					{
						show:true,
						textStyle:
						{
							fontSize: '25',
							fontWeight: 'bold'
						}
					}
				},
				labelLine:
				{
					normal:
					{
						show:true
					}
				},
				data: draw_input
				// [
				// 	{'value':18 , 'name':'a'},
				// 	{value:14 , name:'b'},
				// 	{value:13 , name:'c'},
				// ]
			}
		]
		
	};
	myChart.setOption(option);

	myChart.on('click', function(param){		
		var value;
		var send_title = [];
		opt = myChart.getOption(option);

		var value = {};
		value[type] = [];

		var name = param.data.name.split('(')[0];
		send_title.push(name);
		if(typeof(share_model.data_custom[name]) !== 'undefined')
		{
			for(var i=0; i<share_model.data_custom[name].length; i++)
				value[type].push(share_model.data_custom[name][i]);
		}
		else{
			value[type].push(name);			
		}
		
		
		var result = [{source: 'chart', val: value, type: 'equal', content: send_title}];
		share_model.getFilterCondition(result);		

		$(this).unbind('click');

		// console.log(share_model.condition);
		$(document).trigger('data_filter', share_model.condition);

	});

}

/***************************
e-chart: numeric-data version
***************************/
function draw_chart_num(base, input, type)
{
	// tmp
	// type = 'target_1';
	// base = 'place';
	
	
	echarts.dispose(document.getElementById('myChart'));

	var draw_title = [];
	var draw_cal = [];
	var draw_index = [];
	var draw_sID = [];
	var sum = 0;
	
	// record sID
	for(var i=0;i<input['sID'].length;i++)
	{
		draw_sID.push(Number(input['sID'][i].content));
	}
	// chart title
	for(var i=0;i<input[base].length;i++)
	{
		draw_title.push(input[base][i].name);
		draw_cal[input[base][i].name] = 0;
	}
	// calculate total sum
	for(var i=0;i<input[type].length;i++)
	{		
		sum += Number(input[type][i].content);
		// draw_cal.push(Number(input[type][i].content));
	}

	// find every place's amount in type
	for(var j=0; j<draw_title.length; j++)
	{
		for(var k=0; k<share_model.data['data_category'].length; k++)
		{
			if(share_model.data['data_category'][k][base] == draw_title[j] && draw_sID.includes(Number(share_model.data['data_category'][k]['sID']) ) )
			{
				// draw_cal.push(Number(share_model.data['data_category'][k][type]));
				draw_cal[draw_title[j]] += Number(share_model.data['data_category'][k][type]);
			}
		}
		
	}	
	
	
	// put in draw input data
	var draw_input = [];
	draw_input = input[type];
	var va;
	for(var i=0; i<draw_input.length; i++)
	{
		// va = (draw_cal[draw_title[i]]/sum*100).toFixed(2);
		// if(draw_input[i].name.split('(').length <= 1)
		{
			draw_input[i].name = draw_title[i];
			// draw_input[i].name = draw_title[i];
			draw_input[i].value = draw_cal[draw_title[i]];
		}
	}
	// console.log(draw_input);
	// draw chart
	var myChart = echarts.init(document.getElementById('myChart'));
	
	/*****
		chart settings
	*****/
	var option = {
		tooltip:
		{
			trigger: 'item',
			formatter: "{b}: {c} ({d}%)",
		},
		toolbox: 
		{
			show : true,
			feature : 
			{
				mark : {show: true},
				dataView : {show: true, readOnly: false},
				magicType : 
				{
            		show: true,
            		type: ['pie', 'funnel',]
				},
			// restore : {show: true},
			saveAsImage : {show: true}
			}
		},
		pieToggleSelect:
		{
			type: 'pieselectchanged',
			seriesIndex: draw_title,
			// dataIndex: draw_index
		},
		legend:
		{
			// height: '500px',
			// orient: 'horizontal',
			// y:'top',
			// data: draw_title
		},
		series:
		[
			{
				name: '',
				type: 'pie',
				radius: ['50%', '80%'],
				avoidLabelOverlap: false,
				label:
				{
					normal:
					{
						show:false,
						position:'center'
					},
					emphasis:
					{
						show:true,
						textStyle:
						{
							fontSize: '25',
							fontWeight: 'bold'
						}
					}
				},
				labelLine:
				{
					normal:
					{
						show:true
					},
					emphasis:
					{
						show:true
					}
				},
				data: draw_input
				// [
				// 	{'value':18 , 'name':'a'},
				// 	{value:14 , name:'b'},
				// 	{value:13 , name:'c'},
				// ]
			}
		]
		
	};
	myChart.setOption(option);

	/*****
		chart trigger
	*****/
	myChart.on('click', function(param){
		var value;
		var send_title = [];
		opt = myChart.getOption(option);

		var value = {};
		value[base] = [];
		// value[type] = [];

		var name = param.data.name.split('(')[0];
		// var name = param.data.name;
		send_title.push(name);
		if(typeof(share_model.data_custom[name]) !== 'undefined')
		{
			for(var i=0; i<share_model.data_custom[name].length; i++)
				value[base].push(share_model.data_custom[name][i]);
		}
		else{
			value[base].push(name);			
		}
		
		
		var result = [{source: 'chart', val: value, type: 'equal', content: send_title}];
		share_model.getFilterCondition(result);

		$(this).unbind('click');

		// console.log(share_model.condition);
		$(document).trigger('data_filter', share_model.condition);
	});

	// myChart.on('mouseover', function(param){
	// 	console.log('aaa');
	// 	var value;
	// 	var send_title = [];
	// 	opt = myChart.getOption(option);

	// 	var value = {};
	// 	value[base] = [];

	// 	var name = param.data.name.split('(')[0];
	// 	// var name = param.data.name;
	// 	send_title[0] = name;
	// 	if(typeof(share_model.data_custom[name]) !== 'undefined')
	// 	{
	// 		for(var i=0; i<share_model.data_custom[name].length; i++)
	// 			value[type].push(share_model.data_custom[name][i]);
	// 	}
	// 	else{
	// 		value[base].push(name);			
	// 	}
		
	// 	var result = [{source: 'chart', val: value, type: 'equal', content: send_title}];		
	// 	// share_model.getFilterCondition(result);
	// 	$(this).unbind('click');
	// 	$(document).trigger('data_highlight', result);

	// });

}

/***************************
chart js: numeric-data version
***************************/
function chartjs(base, input, type)
{
	var draw_title = [];
	var draw_cal = [];
	var draw_index = [];
	var draw_sID = [];
	var sum = 0;
	
	// record sID
	for(var i=0;i<input['sID'].length;i++)
	{
		draw_sID.push(Number(input['sID'][i].content));
	}
	// chart title
	for(var i=0;i<input[base].length;i++)
	{
		draw_title.push(input[base][i].name);
		draw_cal[input[base][i].name] = 0;
	}
	// calculate total sum
	for(var i=0;i<input[type].length;i++)
	{		
		sum += Number(input[type][i].content);
		// draw_cal.push(Number(input[type][i].content));
	}

	// find every place's amount in type
	for(var j=0; j<draw_title.length; j++)
	{
		for(var k=0; k<share_model.data['data_category'].length; k++)
		{
			if(share_model.data['data_category'][k][base] == draw_title[j] && draw_sID.includes(Number(share_model.data['data_category'][k]['sID']) ) )
			{
				// draw_cal.push(Number(share_model.data['data_category'][k][type]));
				draw_cal[draw_title[j]] += Number(share_model.data['data_category'][k][type]);
			}
		}
		
	}	
	
	
	// put in draw input data
	var draw_input = [];
	draw_input = input[type];
	var va;
	for(var i=0; i<draw_input.length; i++)
	{
		// va = (draw_cal[draw_title[i]]/sum*100).toFixed(2);
		// if(draw_input[i].name.split('(').length <= 1)
		{
			draw_input[i].name = draw_title[i];
			// draw_input[i].name = draw_title[i];
			draw_input[i].value = draw_cal[draw_title[i]];
		}
	}

	var dataset_arr = {};
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
	dataset_arr.label = '';
	dataset_arr.data = [];
	dataset_arr.backgroundColor = [];
	for(var i=0; i<draw_input.length; i++)
	{
		if(typeof(draw_input[i].name) != 'undefined')
		{
			// dataset_arr[i] = {};
			// dataset_arr[i].label = draw_input[i].name;
			dataset_arr.data.push(draw_input[i].value);
			dataset_arr.backgroundColor.push(colorArray[i]);
		}
		
	}
	// console.log(dataset_arr)
	var ctx = document.getElementById("myChart");

	new Chart(ctx, {
		"type":"doughnut",
		"data":
		{
		  "labels": draw_title,
		  "datasets":[
		  		dataset_arr
			  // {
			  // 	"labels": "Population (millions)",
		   //      "backgroundColor": ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
		   //      "data": [2478,5267,734,784,433]  			
			  // }
		  ]
		},
		"options":{
			maintainAspectRatio: false
		}
	});

}