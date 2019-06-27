google.charts.load('current', {'packages':['corechart', 'controls', 'bar']});


// 
$(document).on("data_start", function(event){
	var post_result = share_model.post_classify(share_model.data['data_category']);
	// console.log(post_result);
	timeline_select(post_result['data']);
	// drag_timeline(post_result['data']);
	
});

$(document).on("data_edit", function(event, input){

	share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);	
	timeline_select(post_result['data']);	
});

$(document).on("data_filter", function(event, input){
	
	
	var state = share_model.state;
	var result_arr = share_model.getResult(input);

	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	

	if(state == true)
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);	
	else
		var post_result = share_model.post_classify(share_model.data_tmp);	
	timeline_select(post_result['data']);
	// drag_timeline(post_result['data']);
});

// 暫時不支援
// $(document).on("data_cluster", function(event, input){
// 	var result_arr = share_model.getResult(input);
// 	share_model.addColumn(input, result_arr);
// 	var post_result = share_model.post_classify(share_model.data['data_category']);
// 	// console.log(post_result);
// 	timeline_select(post_result['data']);
// })

function timeline_select(input)
{
	$('#timeline_header').remove();
	$('#myTimeline').remove();
	$('#slideBar').remove();
	
	// reset chart
	var str = '<div id="myTimeline" style="width: 100%;  margin-top: -50px;"></div>';
	$('#timeline_outer').html(str);
	str = '<div id = "slideBar" style="height: 60%"></div>';
	$('#slide_header').html(str);


	// echarts.dispose(document.getElementById('myTimeline'));
	var type, x_index;
	// var string = '<select id = "chart_option"  onchange="alert(this.options[this.selectedIndex].value)">';
	var string = '<div id="timeline_header"><h4>結果分布圖(長條圖)：</h4>';
	string += '<h5>分類依據：<div style="float:right">共 '+input['sID'].length+' 筆</div><select id = "timeline_option" style="margin-bottom:50px">';
	
	
	var option_flag = 1;
	var x=0;
	for(key in input)
	{
		if(key == 'sID' || key == 'ID')
			continue;
		if(input[key].length>0 && $.isNumeric(input[key][0].name))
		{	
			
			if(x==0)
			{				
				string += '<option value="'+key+'" selected>';
				type = key;
				x_index = share_model.data['data_category'][1][key];
				x++;
			}
			else
			{			
				string += '<option value="'+key+'">';
				// type = key;
				// x_index = share_model.data['data_category'][1][key];			
			}

			string += share_model.data['data_category'][1][key];
			string += '</option>';
		}
	}
	
	string += '</select></h5></div>';
	$('#timeOut').before(string);
	
	// call google chart
	var slider,dashboard,columnChart;
	
	google.charts.setOnLoadCallback(draw_GoogleChart);
	

	$("#timeline_option").change(function(){
		// var text = this.options[this.selectedIndex].text;
		// draw_timeline(input, this.value, this.options[this.selectedIndex].text);
		
		type = this.value;
		draw_Stuff(input, this.value, this.options[this.selectedIndex].text);
		// draw_Stuff_num(input, this.value, this.options[this.selectedIndex].text);


	});

	function draw_GoogleChart()
	{		
		// load google chart				
		draw_Stuff(input, type, x_index);
		// draw_Stuff_num(input, type, x_index);
	}

	function draw_Stuff(input, type, x_index)
	{

		// calculate and sorting			
		var data_year = [];
		var data_year_count = [];
		for(var key in input[type])
		{
			data_year.push(input[type][key].name);
		}	

		// 抓排序的key
		var keysort = Object.keys(data_year).sort(function(a,b){return data_year[a]-data_year[b]});

		for(var key in keysort)
		{
			data_year_count.push(input[type][keysort[key]].value);
		}

		data_year = data_year.sort(sort_number);

		var min_year = data_year.reduce(function(a,b){
			return Math.min(a,b);
		});

		var max_year = data_year.reduce(function(a,b){
			return Math.max(a,b);
		});
			
		// build dashboard and charts
		dashboard = new google.visualization.Dashboard(document.getElementById('timeOut'));

		slider = new google.visualization.ControlWrapper({
			'controlType': 'ChartRangeFilter',
			'containerId': 'slideBar',
			'options': {
				'filterColumnLabel': '數量',
				'filterColumnIndex': 0,
				'ui': {
					'labelStacking': 'vertical',
					'chartOptions':{
						// 'chartArea': {
						// 	'height':'30%',							
						// },
						'height': 60,
						'width': '100%'
					},
					'minRangeSize':1
				},
				'minValue': min_year,
				'maxValue': max_year

			}
		});

		columnChart = new google.visualization.ChartWrapper({
			'chartType': 'ColumnChart',
			'containerId': 'myTimeline',
			'options':{
				'width': '150%',
				'height': '50%',
				'legend': 'none',
				'vAxis':{
					title: '數量'
				},
				'hAxis':{
					title: x_index
				},
				'bar': {groupWidth:'70%'}
			}			
		});

		// build data
		var arr = [['Name','數量']];
		for(var i=0; i<data_year.length; i++)
		{
			arr.push([Number(data_year[i]), Number(data_year_count[i])]);			
		}		
		
		var data_tmp = google.visualization.arrayToDataTable(arr);

		// bind charts & data
		dashboard.bind(slider, columnChart);
		dashboard.draw(data_tmp);

		
	}


	// trigger event	
	$("#slideBar").on('mouseup',function(e){
		$('#slideBar').unbind();		
		var state = slider.getState();
		var tstart = Number(state.range.start);
		var tend = Number(state.range.end);
			
		var value = {};
		value[type] = [];
		value[type].push(tstart);
		value[type].push(tend);

		var result = [{source: 'timeline', val: value, type: 'range'}];
		share_model.getFilterCondition(result);
		share_model.condition[0].type = 'range';
		
		// console.log(share_model.condition);

		if(typeof(tstart) != 'undefined' && typeof(tend) != 'undefined' ){

			$(document).trigger('data_filter', share_model.condition);
		}
	});
	// drag_timeline(data);
}

function sort_number(a, b)
{
	return a-b;
}
