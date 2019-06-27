/**
 * shared_model.js
 *
 * @copyright 
 * 
 * @version 0.1.3
 * @author  Leo Chou
 * @updated 2018-03-10
 * Copyright (C) 2018
 * @license 
 *
 */
var ShareModel = function()
{	
	// this.header_array = ['地名','經度','緯度','時間']
	this.header_array = ['ID', 'place', 'lng', 'lat', 'year', 'year_start', 'year_end', 'year_chinese', 'date', 'type', 'title', 
						 'content', 'author', 'person', 'origin', 'keyword', 'count', 'sum', 'tag', 'target_data', 'average'
	];
	this.data = []
	this.place_content = [];
	this.loc_content = [];
	this.lng_content = [];
	this.time_content = [];
	this.item_content = [];		
	this.condition = [];
	this.condition_filter = [];
	this.condition_manager = [];
	this.data_tmp = [];		// 存取篩選後的資料
	this.data_custom = [];	// 存取自定義group的data
	this.state = true;
	this.highlight_flag = 0;
	this.time_arr = [];

		// reset data_tmp
	this.reset_data = function()
	{
		// console.log(this.data_tmp);
		this.data_tmp = [];
		this.data_tmp.push(this.data.data_category[0]);	// defined label
		this.data_tmp.push(this.data.data_category[1]);	// index header
	}
	// reset all data
	this.reset = function()
	{		
		this.data = [];
		this.place_content = [];
		this.loc_content = [];
		this.lng_content = [];
		this.time_content = [];
		this.item_content = [];		
		this.condition = [];
		this.condition_filter = [];
		this.condition_manager = [];
		this.data_tmp = [];
		this.data_custom = [];
		this.state = true;
		this.highlight_flag = 0;
		this.time_arr = []
		
	}
	// get input data and process it
	this.getInput = function(data_content, data_headers)
	{
		// reset
		
		this.reset();
		// console.log(data_content);
		var item_index;
		var json_arr = '[';
		var json_header = ['sID'];
		var index = 1;
		for(var i=0; i<data_headers.length; i++)
		{
			
			if(this.header_array.includes(data_headers[i]))
			// if(data_headers[i] != '')
			{
				// json_header.push(data_headers[i]);
				json_header[index] = data_headers[i];
			}
			else if(data_headers[i] != '')
			{				
				json_header[index] = data_headers[i];
			}
			else
				json_header[index] = '';
			index++;
			
		}

		for(var i=0; i<data_content.length; i++)
		{
			var content_str = '{';
			item_index = 1;
			// +1 because of sid
			for(var j=0; j<data_headers.length+1; j++)
			{
				// console.log(typeof(json_header[j]));
				if(json_header[j] == '')
				{					
					content_str += '\"'+'item'+item_index+'\": ';
					content_str += '\"'+str_replace(data_content[i][j-1])+'\" ,';
					item_index++;
				}
				else if(json_header[j] == 'sID')
				{
					content_str += '\"'+str_replace(json_header[j])+'\": ';
					content_str += '\"'+(i-1)+'\" ,';	
				}				
				else // user defined tag
				{
					content_str += '\"'+str_replace(json_header[j])+'\": ';
					content_str += '\"'+str_replace(data_content[i][j-1])+'\" ,';
				}
			}
			content_str = content_str.substring(0,content_str.length-2);
			content_str += '}, ';
			json_arr += content_str;
		}
		json_arr = json_arr.substring(0,json_arr.length-2);
		json_arr += ']';
		// console.log(json_arr)
		try{
			this.data = JSON.parse(json_arr);	
		}
		catch(e)
		{
			console.log(e);
			alert('error');
			window.location = 'index.html';
		}
		

		// assign all data & every category
		
		data_content = {data:data_content, data_category: this.data};		
		this.data = data_content;
		this.data_tmp = data_content.data_category;
		// console.log(this.data.data_category)
		return data_content;

	}

	// post classification (calculate number)
	this.post_classify = function(data = '', filter = '')
	{
		// console.log(this.data_custom);
		// console.log(data2.length);
		// var data = this.data['data_category'];
		var post_index = [];
		var post_header = [];
		var overall_arr = {};
		
		if(filter != '')
		{
			// 得到match的data
			
			var post_filter = [];
			post_filter.push(data[0]);
			post_filter.push(data[1]);
			for(var i=0; i<filter.length; i++)
			{						
				post_filter.push(data[filter[i]+1]);
			}
			data = post_filter;			
		}
		
		// categorize
		var push_tmp = [];
		for(var i=0; i<data.length; i++)
		{
			if(i==0)
			{				
				for(key in data[i])
				{
					post_index.push(key);
					overall_arr[key] = [];
				}
			}	
			else if(i==1)
			{				
				for(key in data[i]){
					if(data[i][key] == '')
						data[i][key] = ' ';
					post_header.push(data[i][key]);
				}
			}
			else
			{				
				for(key in data[i])
				{
					for(var j=0; j<post_index.length; j++)
					{
						if(key == post_index[j])
						{							
							// maybe need to adjust
							if(key.indexOf('user_defined') == -1)
								overall_arr[post_index[j]].push(data[i][key]);
							else
							{
								push_tmp = [];
								// 存入每個選項
								for(var k=0; k<data[i][key].length; k++)
								{
									push_tmp.push(data[i][key][k]);
								}

								for(var k=0; k<push_tmp.length; k++)
								{
									overall_arr[post_index[j]].push(data[i][key][k]);
								}
								
							}
						}
					}
				}
			}
		}

		var result = {};
		var post_result = {};
		var post_result_num = {};

		//  計算後分類的每個項目的數量
		for(key in overall_arr)
		{			
			post_result[key] = [];
			post_result_num[key] = [];
			for(var i=0; i<overall_arr[key].length; i++)
			{				
				if(post_result[key].indexOf(overall_arr[key][i]) < 0 && overall_arr[key][i]!='')
				// if(post_result[key] !== overall_arr[key][i] && overall_arr[key][i]!='')
				{
					post_result[key].push(overall_arr[key][i]);
					post_result_num[key][overall_arr[key][i]] = 1;
				}
				else
					post_result_num[key][overall_arr[key][i]]++;
			}			

		}
		
		
		// format transfer
		var post_result = {};		
		for(key in post_result_num)
		{
			post_result[key] = '[';
			for(index in post_result_num[key])
			{
				if(index == '') continue;
				if(typeof(this.data_custom[index]) == 'undefined')
				{
					if(key.indexOf('user_defined') == -1)
						post_result[key] += '{"name":"'+index+'" ,"value":'+post_result_num[key][index]+' ,"content":"'+index+'"}, ';
				}
				else
				{
					// if user_defined data, load from data_custom
					post_result[key] += '{"name":"'+index+'" ,"value":'+post_result_num[key][index]+' ,"content":"'+this.data_custom[index]+'"}, ';
				}
			}
			post_result[key] = post_result[key].substring(0,post_result[key].length-2);
			if(post_result[key] != '')
				post_result[key] += ']';
		}
		
		// console.log(post_result);
		// 後分類排序
		for(key in post_result)
		{
			if(post_result[key] != '')
			{
				post_result[key] = JSON.parse(post_result[key]);
				post_result[key].sort(function(a,b)
				{
					if(a.value < b.value)
						return 1;
					if(a.value > b.value)
						return -1;
					else
						return 0;
				});
			}
		}
		
		var return_data = {header: post_header, data: post_result};
		
		return return_data;
		
	}

	// string replace
	function str_replace(input)
	{
		var output;
		output = input.replace(/\r\n/g,"");
		output = output.replace(/\n/g,"");
		output = output.replace(/\r/g,"");
		output = output.replace(/\\/g,"");
		output = output.replace(/\//g,"");
		output = output.replace(/\'/g,"");
		output = output.replace(/\"/g,"＂");	
		return output;
	}

	// push content to every array
	function push_content(data, array, ind)
	{
		for(var j=1; j<data.length;j++)
		{
			array.push(data[j][ind]);
			// console.log(data[j][ind]);
		}

		return array;
	}

	// 計算篩選結果
	this.getResult = function(input_data)
	{		
		var type = input_data.type;
		var result_arr = [];
		var filter_flag = 0;
		// console.log(input_data);
		// 各種條件
		for(key in input_data.val)
		{
			
			// split the key and get the last name			
			data_key = key.split('＿');
			data_key = data_key[data_key.length-1];
			
			// console.log('!!!!!!')
			if(result_arr.length == 0 && filter_flag == 0){
				filter_flag = 1;
				result_arr = filter_result(this.data, input_data, data_key, key, type);
			}
			else{
				result_arr = array_inter(result_arr, filter_result(this.data, input_data, data_key, key, type));
			}			
		}


		return result_arr;
	}

	this.getResultBySM = function(SMcondition)
	{		
		var type = input_data.type;
		var result_arr = [];
		var filter_flag = 0;
		// console.log(input_data);
		// 各種條件
		for(key in input_data.val)
		{
			
			// split the key and get the last name			
			data_key = key.split('＿');
			data_key = data_key[data_key.length-1];
			
			// console.log('!!!!!!')
			if(result_arr.length == 0 && filter_flag == 0){
				filter_flag = 1;
				result_arr = filter_result(this.data, input_data, data_key, key, type);
			}
			else{
				result_arr = array_inter(result_arr, filter_result(this.data, input_data, data_key, key, type));
			}			
		}


		return result_arr;
	}

	// this.getNotResult = function(input)
	// {
	
	// 	var not_arr = [];	
	// 	for(var i=1; i<this.data['data_category'].length; i++)
	// 	{
	// 		if(!input.includes(i))
	// 			not_arr.push(i);
	// 	}
	// 	return not_arr;
	// }

	// get filter condition
	this.getFilterCondition = function(result)
	{
		// this.condition = [];
		// var condition_tmp = this.condition;
		
		if(this.highlight_flag == 1){
				this.condition = this.condition_filter;
				this.highlight_flag = 0;
		}
		// if have condition
		if(this.condition.length>0 && this.state == 1)
		{
			this.condition[0]['source'] = result[0].source;
			
			if(typeof(result[0].content) != 'undefined' && this.condition[0].type != 'range')
			{
				// for 條件紀錄
				for(var i=0; i<result[0].content.length; i++)
				{			
					if(!this.condition[0]['content'].includes(result[0].content[i]))
						this.condition[0]['content'].push(result[0].content[i]);
				}
			}
			
			// push進本來的條件			
			for(var r_key in result[0].val)
			{
				var flag = false;
				for(var s_key in this.condition[0].val)
				{
					// 有重複的index的話 先重置再push新內容進去
					if(r_key == s_key)
					{
						// this.condition[0].val[key].push()					
						this.condition[0].val[r_key] = [];
						for(var i=0; i<result[0].val[r_key].length; i++)
						{
							this.condition[0].val[r_key].push(result[0].val[r_key][i])
						}	
							
						flag = true;
					}
				}
				if(flag == false)
				{
					this.condition[0].val[r_key] = [];
					for(var i=0; i<result[0].val[r_key].length; i++)
						this.condition[0].val[r_key].push(result[0].val[r_key][i])
				}
			}

			this.manage(this.condition);
		}
		else if(this.state == 0)			// highlight mode
		{
			this.highlight_flag = 1;

			// 將highlight的條件存進condition manager 方法同上
			var condition_tmp = $.extend(true, [], this.condition);
			if(this.condition.length>0){
				for(var r_key in result[0].val)
				{
					var flag = false;
					for(var s_key in condition_tmp[0].val)
					{
						// 有重複的index的話 先重置再push新內容進去
						if(r_key == s_key)
						{
							// this.condition[0].val[key].push()					
							condition_tmp[0].val[r_key] = [];
							for(var i=0; i<result[0].val[r_key].length; i++)
							{
								condition_tmp[0].val[r_key].push(result[0].val[r_key][i])
							}	
								
							flag = true;
						}
					}
					if(flag == false)
					{
						condition_tmp[0].val[r_key] = [];
						for(var i=0; i<result[0].val[r_key].length; i++)
							condition_tmp[0].val[r_key].push(result[0].val[r_key][i])
					}
				}
				this.manage(condition_tmp);

				this.condition_filter = this.condition;
				this.condition = result;
			}
			else{
				this.condition_filter = this.condition;
				this.condition = result;	
				this.manage(this.condition);
			}
			
		}
		else{
			this.condition = result;	
			this.manage(this.condition);
		}

		// save to condition manager
		// this.manage(this.condition);
		
		// console.log(this.condition_manager);
	}

	// condition manager
	this.manage = function(input)
	{		
		// deep copy
		var b = $.extend(true, [], input);
		var st = new Date().getTime()/1000;
		
		// 利用time來暫時解決重複條件的問題
		if(this.time_arr.length > 0)
		{
			if(st-this.time_arr[this.time_arr.length-1] < 1 )
			{				
				this.time_arr[this.time_arr.length-1] = st;
				this.condition_manager[this.condition.length-1] = [b, this.state, this.data_tmp];
			}	
			else
			{
				this.time_arr.push(st);
				if(this.condition_manager.indexOf([b, this.state, this.data_tmp]) < 0)
					this.condition_manager.push([b, this.state, this.data_tmp]);
			}
		}
		else
		{
			this.time_arr.push(st);
			this.condition_manager.push([b, this.state, this.data_tmp]);
		}

		// if(this.condition_manager.indexOf([b, this.state, this.data_tmp]) < 0)
		// 	this.condition_manager.push([b, this.state, this.data_tmp]);
			
		// this.condition_manager.push([b, this.state, this.data_tmp]);
		// console.log(this.condition_manager);
	}


	// add column
	this.addColumn = function(input, index)
	{
		// console.log(input);
		var add_flag = 0;
		var ind;

		// 將該選項之content存入
		if(typeof(this.data_custom[input.title]) == 'undefined')
			this.data_custom[input.title] = [];
		for(var key in input.val)
		{
			ind = key;			
			for(var i=0; i<input.val[key].length; i++)
			{				
				this.data_custom[input.title].push(input.val[key][i]);
			}
		}
		
		// custom user_defined data index name
		if(typeof(input['type2']) != 'undefined')
			var title = 'user_defined_'+input['type2']+'＿'+ind;
		else
			var title = 'user_defined＿'+ind;

		for(var i=0; i<this.data.data_category.length; i++)
		{
			if(typeof(this.data.data_category[i][title]) == 'undefined')
				this.data.data_category[i][title] = [];

			if(i==1)
			{				
				// 若為sID的狀況時(user_defined data by table icon)
				if(this.data['data_category'][1][ind] == '0')
				{
					this.data.data_category[i][title][0] = '使用者自訂_'+input['type2'];
					// this.data.data_category[i][title].push('使用者自訂_'+input['type2']);
				}
				else
				{
					this.data.data_category[i][title][0] = '使用者自訂_'+this.data['data_category'][1][ind];
				}

				// console.log(this.data.data_category[i][title][0]);
			}
			add_flag = 0;
			for(var j=0; j<index.length; j++)
			{
				// 用ID判斷
				if(index[j] == this.data.data_category[i].sID)
				{
					add_flag = 1;
					break;
				}				
			}
			if(add_flag == 1)
			{												
				// 若該欄位不只一個自訂選項
				if(!this.data.data_category[i][title].includes(input.title))
					this.data.data_category[i][title].push(input.title);
				// else
				// 	this.data.data_category[i][title] += ', '+input.title;
			}
		}


	}

	this.editData = function(input)
	{
		// 以sid為基準做修改資料
		console.log(input)
		if(typeof(input) == 'undefined')
			return;
		var key_tmp;
		var key_sid = parseInt(input.sID);
		
		for(key in input)
		{
			for(key2 in this.data['data_category'][key_sid+1])
			{						
				if(key == key2)
					if(key.startsWith('user_defined'))	// for user defined data
					{
						
						this.data['data_category'][key_sid+1][key][0] = input[key];
							
						// 加入給大家共用的data_custom array
						if(typeof(this.data_custom[input[key]]) == 'undefined')
							this.data_custom[input[key]] = [];
						
						key_tmp = key.split('＿');
						key_tmp = key_tmp[key_tmp.length-1];
						
						this.data_custom[input[key]].push(input[key_tmp]);
					}
					else
						this.data['data_category'][key_sid+1][key] = input[key];
			}
		}
	}

	// 篩選出結果
	function filter_result(origin_data, input_data, data_key, key, type)
	{		
		var result = [];
		var result2 = [];
		var res = [];

		// console.log(data_key)
		// console.log(key)
		// console.log(type)
		// console.log(input_data);
		// console.log(origin_data);
		// if(data_key != 'item')
		{
			for(var i=2; i<origin_data['data_category'].length; i++)
			{
				// $('#table_data'+(i+1)).removeClass('highlight');				
				if(type == 'equal')
				{
					for(var j=0; j<input_data['val'][key].length; j++)
					{
						// console.log(origin_data['data_category'][i][data_key]+' ////// ' + input_data.val[key][j]);																
						if(origin_data['data_category'][i][key] != '')
						{
							if(origin_data['data_category'][i][data_key] == input_data.val[key][j])
							{
								if(typeof(input_data['content']) != 'undefined')
								{
									// 判斷content是否符合
									for(var k=0; k<input_data['content'].length; k++)
									{
										// console.log(origin_data['data_category'][i][key]);
										if(origin_data['data_category'][i][key].includes(input_data['content'][k]))
										{
											result.push(i-1);	// 扣掉自定義的那層
											break;
										}
									}
								}
								else	// for data_cluster
								{
									if(origin_data['data_category'][i][data_key] == input_data.val[key][j])
										result.push(i-1);	// 扣掉自定義的那層
								}
								
							}

						}						
						
						// else
						// {
						// 	if(origin_data['data_category'][i][data_key] >= input_data.val[key][j])
						// 		result.push(i-1);	// 扣掉自定義的那層
						// }
					}
				}
				else	// type = range
				{					
					// 若是數值型態
					if($.isNumeric(origin_data['data_category'][i][data_key]))
					{
						// console.log(typeof(input_data.val[key][1]));
						if(typeof(input_data.val[key][1]) != 'undefined')
						{
							if((Number(origin_data['data_category'][i][data_key]) <= Number(input_data.val[key][1])) && (Number(origin_data['data_category'][i][data_key]) >= Number(input_data.val[key][0])))
								result.push(i-1);	// 扣掉自定義的那層
						}
						else
						{
							for(var j=0; j<input_data['val'][key].length; j++){
								if(origin_data['data_category'][i][data_key] == input_data.val[key][j])
									result.push(i-1);	// 扣掉自定義的那層
							}
						}
						
					}
					// 若不是數值型態
					else
					{
						// console.log('NON-numeric');
						for(var j=0; j<input_data['val'][key].length; j++)
						{
							// console.log(origin_data['data_category'][i][data_key]+' ////// ' + input_data.val[key][j]);					
							if(origin_data['data_category'][i][data_key] == input_data.val[key][j])
								result.push(i-1);	// 扣掉自定義的那層
						}
					}
					// console.log(result);
				}

			}
		}

		// console.log(result)
		
		return result;
	}

	// merge and delete the duplicate
	function array_unique(array) 
	{
		var a = array.concat();
		for(var i=0; i<a.length; ++i) 
		{
			for(var j=i+1; j<a.length; ++j) 
			{
				if(a[i] === a[j])
					a.splice(j--, 1);
			}
		}
		return a;
	}	
	// var array3 = arrayUnique(array1.concat(array2));
	
	function array_inter(a, b)
	{
		var result = [];
		while(a.length > 0 && b.length > 0)
		{
			if(a[0] < b[0] )
				a.shift(); 
			else if(a[0] > b[0] )
				b.shift();
			else
			{
				result.push(a.shift());
				b.shift();
			}
		}
		return result;
	}

	// check if lock or not
	this.checkState = function()
	{
		var lock_class = $('#unlock_doughnut').attr('class');
		if(lock_class == "fas fa-lock")	
			return true;
		else
			return false;
	}
}

var share_model = new ShareModel();
