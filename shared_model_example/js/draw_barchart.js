google.charts.load('current', {'packages':['corechart']});

// 
$(document).on("data_start", function(event){
	var post_result = share_model.post_classify(share_model.data['data_category']);
	// console.log(post_result);
	bar_select(post_result['data']);
	
});

$(document).on("data_edit", function(event, input){
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);	
	bar_select(post_result['data']);	
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
		var post_result = share_model.post_classify(share_model.data_tmp, result_arr);	
	// console.log(post)
	bar_select(post_result['data']);	
});

/*
	have bugs if no 'place' tags
 */
function bar_select(input)
{
	// reset
	$('#bar_header').remove();
	$('#barChart').html('');
	
	/*
		設定範圍選項
	 */
	var start, end;
	var range_arr = [];

	var chart_flag = 0;
	var str = '<div id="bar_header"><h4>長條統計圖：</h4>';
	var str_end;
	str += '<h5>範圍:<select id="bar_select_start" style="margin:3px">';
	str_end = ' - <select id="bar_select_end" style="margin:3px">';
	var x=0;
	var base;	
	var type;
	var type_flag = 0;
	var key_flag = 0;
	// for second option
	var key_end_arr = [];
	var key_end_flag = 0;

	
	for(key in input)
	{
		// 只吃target tag開頭
		if(!key.startsWith('target'))
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
				str += '<option value="'+key+'" selected>';
				start = key;
				key_flag = 1;
			}
			else
			{
				str += '<option value="'+key+'">';
			}
			key_end_arr.push(key);

		}

		str += share_model.data['data_category'][1][key];
		str += '</option>';

	}

	str += '</select>';

	// 第二個option抓最後一個
	for(var i=0; i<key_end_arr.length; i++)
	{
		if(i == key_end_arr.length-1)
		{
			str_end += '<option value="'+key_end_arr[i]+'" selected>';
			end = key;
		}
		else
			str_end += '<option value="'+key_end_arr[i]+'">';

		str_end += share_model.data['data_category'][1][key_end_arr[i]];
		str_end += '</option>';
	}
	str_end += '</select>';	

	// 有符合條件的才畫圖
	if(chart_flag == 1)
	{
		var str_bt = '<button class="btn btn-primary" id="bar_button" style="margin-left:3px">執行</button>';
		str_bt += '</h5></div>';
		$('#barChart').before(str+str_end+str_bt);
	}
	else 
		return;

	$('#bar_button').click(function(){
		start = $('#bar_select_start').val();
		end  = $('#bar_select_end').val();

		// 存入範圍的index
		var st = key_end_arr.indexOf(start);
		var en = key_end_arr.indexOf(end);
		var out_arr = [];
		for(var i=st; i<=en; i++)
		{
			out_arr.push(key_end_arr[i]);
		}
		draw_bar(input, out_arr);
	});
	
	// call google chart
	google.charts.setOnLoadCallback(draw_GoogleBar);

	// draw bars
	function draw_GoogleBar()
	{
		draw_bar(input, key_end_arr);
	}

	function draw_bar(input, range_arr)
	{
 		// console.log(share_model.data['data_category']); 		
 		var origin_data = share_model.data['data_category'];
 		// console.log(input);
 		
 		// get filter result
 		var sid_arr = [];
 		for(key in input)
 		{
 			if(key == 'sID')
 			{
 				for(var i=0; i<input[key].length; i++)
 					sid_arr.push(input[key][i].content);
 			}
 		}


 		// use place as y-axis
 		var base = 'place';
 		var y_axis_data = [];
 		var sum = 0;
	
 		for(var i=0; i<input[base].length; i++)
 		{
 			y_axis_data[input[base][i].name] = 0;	
 		}
		
 		var index;
		for(var j=2; j<origin_data.length; j++)	// ignore first two row
		{
			sum = 0;
			index = '';
			// y_axis_data[sid_arr[i]] = [];
			for(var key in origin_data[j])
			{
				// if(data[j]['sID'] == sid_arr[i])
				if(sid_arr.includes(origin_data[j]['sID']) )
				{
					// 只計算target開頭的tag
					if(key.startsWith('target') && range_arr.includes(key))
					{
						sum += Number(origin_data[j][key]);						
					}
					index = origin_data[j][base];
				}
 			}

 			if(index != '')
 				y_axis_data[index] += sum;
		}
 			
 		// console.log(y_axis_data)

 		// template
 		var title = [[base, '數量']];
 		
 		for(key in y_axis_data)
 		{
 			title.push([key, y_axis_data[key]]);
 		}
 		var data = google.visualization.arrayToDataTable(
 			title 			
 		);
 		var options = {
 			// title: '',
 			width: '100%',
 			height: 400,
 			bar: {groupWidth:"80%"},
 			legend: {position:"none"},
 			chartArea:{top:20}
 		};
 		var view = new google.visualization.DataView(data);
 		var chart = new google.visualization.BarChart(document.getElementById("barChart"));
 		chart.draw(view, options);
 		// var data = google.visualization.arrayToDataTable([
   //      	["Element", "Density", { role: "style" } ],
   //      	["Copper", 8.94, "#b87333"],
   //      	["Silver", 10.49, "silver"],
   //      	["Gold", 19.30, "gold"],
   //      	["Platinum", 21.45, "color: #e5e4e2"]
   //    	]);

	      // var options = {
       //  	title: "Density of Precious Metals, in g/cm^3",
       //  	width: 600,
       //  	height: 400,
       //  	bar: {groupWidth: "95%"},
       //  	legend: { position: "none" },
      	// 	};

	      // var view = new google.visualization.DataView(data);
	      // var chart = new google.visualization.BarChart(document.getElementById("barChart"));
	      // chart.draw(view, options);
	  
	}
}