var overall = [];
var count = [];
function file_upload()
{
	$("#file_upload").click();
}

function upload()
{	
	var file = $("#file_upload")[0].files[0];
	var reader = new FileReader();

	reader.readAsText(file);
	// reader.onload = loadHandler;
	reader.onload = function(event)
	{
		var csv = event.target.result;
		// get csv content
		// processCSV(csv);	
		
		console.log(Papa.parse(csv));
		
	}

}
function processCSV(csv)
{
	var allTextLines = csv.split(/\r\n|\n/);
    var result = [];
    var i, j;
    
    // parse csv data
    result = Papa.parse(csv);
    
    // ============================= get every data in the file
    var tag_type, filename ;
    
    var titles =  result.data[0];
    var split_result, title_result;
    var term_position=0, freq_position=0, category_position=0, filename_position=0;

    // get position
    for(j=0; j<titles.length;j++)
    {    	
    	title_result = titles[j];
    	if('Category' == title_result)
    	{
    		category_position = j;
    	}
    	else if('Filename' == title_result)
    	{
    		filename_position = j;
    	}
    	else if('Term' == title_result)
    	{    		
    		term_position = j;
    		// break;
    	}
    	else if ('Frequency' == title_result)
    	{
    		freq_position = j;
    		// break;
    	}
    	if(term_position >0 && freq_position >0 && category_position >0 
    		&& filename_position >0) break;
    }    

    // 先只取1000
    // get content
    var content ;
    for(i = 1; i < 1000; i++)
    {    	    	   
    	// 0: category 1:corpus 2: 
    	split_result = result.data[i];
    	// console.log(category_position) ;
    	tag_type = split_result[category_position];
    	filename = split_result[filename_position];
    	term 	 = split_result[term_position];
    	freq 	 = parseInt(split_result[freq_position]);
    	content = {'filename': filename,'tag_type': tag_type, 'term': term, 'freq': freq};
    	overall.push(content);    	
    }
    
    
    // show on the screen 
    var option_str = '';
    var tag_tmp = [];
    var type_name = '';
    for(i = 0 ; i < overall.length; i++)
    {
    	if(tag_tmp.indexOf(overall[i].tag_type) == -1) //只抓不重複的
    	{
    		tag_tmp.push(overall[i].tag_type);
    		// switch(overall[i].tag_type)
    		// {
    		// 	case 'PersonName':
    		// }

    		option_str += '<option value=\''+overall[i].tag_type+'\'>'+overall[i].tag_type+'</option>';
    	}

    	
    }

    $("#div_interface").show();
    // console.log(option_str);
    $("#category").append(option_str);
    console.log('end');    

    filter_tag(overall[0].tag_type);
}

// var unique = myArray.filter((v, i, a) => a.indexOf(v) === i); 
// function onlyUnique(value, index, self) { 
//     return self.indexOf(value) === index;
// }

function filter_tag(type)
{
	var table_str = '內容:<br><table class="table table-striped">';
	
	var term = [];
	var str = '';
	
	// 算term frequency
	for(i = 0 ; i < overall.length; i++)
	{
		if(overall[i].tag_type == type)
			term[overall[i].term] = 0;	
	}
	for(i = 0 ; i < overall.length; i++)
	{
		if(overall[i].tag_type == type)
		{			
			term[overall[i].term] += overall[i].freq ;
		}
	}

	var tmp_key = [];	// 判斷是否有重複的term
	for(i = 0 ; i < overall.length; i++)
	{
		if(overall[i].tag_type == type )
		{
			for(key in term)
			{
				if(overall[i].term == key && tmp_key.indexOf(key) == -1)
				{
					tmp_key.push(key);
					str = {'filename': overall[i].filename, 'term': overall[i].term, 'freq': term[overall[i].term]};
					count.push(str);
					break;
				}
			}
			
			
		}
	}
	
	// 排序frequency
	count = count.sort(function(a, b){ return a.freq > b.freq ? -1 : 1;});    

	
	for(i = 0 ; i < count.length; i++)
	{		
		table_str += '<tr>';
		table_str += '<td onclick="fetch_data('+i+')">';
		table_str +=  count[i].term+' ('+count[i].freq+')';		
		table_str += '</td>';
		table_str += '</tr>';
	}
	// console.log(count);
	
	table_str += '</table>';

	$("#div_content").html('');
	$("#div_content").html(table_str);
}

function fetch_data(index)
{
	var i,j;
	var filename = [];
	for(i=0; i<overall.length; i++)
	{
		if(overall[i].term == count[index].term)
		{
			filename.push(overall[i].filename);
		}
	}

	console.log(filename);

}