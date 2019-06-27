$(document).on("data_start", function(event){
		
	// var post_result = share_model.post_classify(share_model.data['data_category']);	
	// showClassification(post_result);

	showCondition();
});

$(document).on("data_edit", function(event){
		
	// var post_result = share_model.post_classify(share_model.data['data_category']);	
	// showClassification(post_result);

	showCondition();
});


$(document).on("data_filter", function(event, input){

	var state = share_model.state;
	var result_arr = share_model.getResult(input);	
	// console.log(share_model.condition_manager);
	showCondition();
	
});

var show_str_arr = [];
function showCondition()
{
	
	$('#condition_content').html('');
	var str = '';
	// str += '<ul>';

	for(var i=0; i<share_model.condition_manager.length; i++)
	{
		str += '<li><a href="#" id="condition'+i+'" data-toggle="tooltip"  onclick="conditionTrigger('+i+')" onmouseover="showContent('+i+')" >條件'+(i+1);
		str += '</a><li>';

		// $('#condition'+i).on('click',function(){
		// 	console.log(share_model.condition_manager[i]);
		// })
	}
	
	$('#condition_content').append(str);
}

function conditionTrigger(i)
{
	var val = share_model.condition_manager[i];
	if(val[1] == true)
	{
		$('#mode_toggle').bootstrapToggle('on');
		share_model.state = true;
		
	}
	else
	{
		$('#mode_toggle').bootstrapToggle('off');
		share_model.state = false;
		
	}

	// 恢復成當時的資料
	share_model.data_tmp = val[2];
	
	// 恢復成當時的條件
	// share_model.condition = val[0];

	$(document).trigger('data_filter', val[0]);

}

function showContent(input)
{
	var content = share_model.condition_manager[input];

	var str = '';
	var title;
	var mode ;
	if(content[1] == true)
		mode = '篩選';
	else
		mode = '強調';

	// console.log(content);
	for(var key in content[0][0].val)
	{
		// console.log(content[0][0].val[key].length);
		str += share_model.data['data_category'][1][key]+': ';
		for(var i=0; i<content[0][0].val[key].length; i++)
		{
			// console.log('!');
			str += content[0][0].val[key][i]+', ';
		}
		str = str.substring(0,str.length-2);
		str += '<br>'
	}
	
	// console.log(str);
	$('#condition'+input).tooltip(
		{
			title: '<h4>'+mode+': </h4><h5>'+str+'</h5>',
			html:true,
			placement: "bottom"
		}
	);

}