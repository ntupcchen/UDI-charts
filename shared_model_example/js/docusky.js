// for docusky
var docuSkyObj = null;
var docuSkyObj2 = null;
var document_name;
var sheet_name;
$(window).ready(function()
{
	docuSkyObj = docuskyGetDbCorpusDocumentsSimpleUI;
	
	/*****
		import from docusky
	*****/ 
	$('#getDocuSky').click(function(e){
		var param = {};
		docuSkyObj.getQueryResultDocuments(param, e, displayDocuSky);
		
	});

	docuSkyObj2 = docuskyManageDbListSimpleUI;
	$('#uploadDocuSky').click(function(e){
		if(confirm('確定儲存至docusky?'))
		{
			var upload_name = document_name+'_'+sheet_name;
			/*****
				get jqgrid data
			*****/
			var tableData = $('#table_content').jqGrid('getGridParam','data');		
			
			var columnNames = $("#table_content").jqGrid('getGridParam','colNames');
			var col_arr = [];
			var col_ind = 0;
			for(var i=0; i<columnNames.length; i++)
			{
				// not push default and sid
				if(i==0) continue;
				col_arr.push(columnNames[i]);
			}		
			
			/*****
				convert to docuXML format
			*****/			
			var xml_str = '<?xml version = "1.0"?>\n';
			xml_str += '<ThdlPrototypeExport>\n';
			xml_str += '\t<documents>\n';
			for(var i=0; i<tableData.length; i++)
			{
				xml_str += '\t\t<document filename = "'+tableData[i]['sID']+'">\n';
				xml_str += '\t\t\t<corpus>'+upload_name+'</corpus>\n';
				xml_str += '\t\t\t<compilation>'+upload_name+'</compilation>\n';

				xml_str += '\t\t\t<doc_content>\n';
				xml_str += '\t\t\t\t<TableRow>\n';
				col_ind = 0;
				for(key in tableData[i])
				{
					// if(key == 'sID') // do not save sid
						// continue;
					xml_str += '\t\t\t\t\t<Cell Name = "'+col_arr[col_ind++]+'" attr="'+key+'">'+tableData[i][key]+'</Cell>\n';
				}			

				xml_str += '\t\t\t\t</TableRow>\n';
				xml_str += '\t\t\t</doc_content>\n';

				xml_str += '\t\t</document>\n';
			}
			
			xml_str += '\t</documents>\n';
			xml_str += '</ThdlPrototypeExport>\n';
			// downloadFile('test.xml', xml_str)
			/*****
				upload to docusky directly
			*****/
			docuSkyObj2.manageDbList(e, function(){
				var xmlString = xml_str,
					// dbTitle = DOM.$uploadDocuSkyDocsTitle.val().trim() === "" ? Date.now() : DOM.$uploadDocuSkyDocsTitle.val().trim(),
					dbTitle = upload_name,
					filename = upload_name+'.xml',
					url = docuSkyObj2.urlUploadXmlFilesToBuildDbJson,
					formData = {
						dummy: {
							name: 'dbTitleForImport', 
							value: dbTitle
						},
						file: {
							value: xmlString,
							filename: filename,
							name: 'importedFiles[]'
						}
					};
				docuSkyObj2.hideWidget();
				docuSkyObj2.uploadMultipart(url, formData, function(){/* Do nothing*/});
			});
		}
	});


});
function displayDocuSky()
{
	resetAll();
	// show components
	$('#reset_div').show();
	$('#sync_mode').show();
	$('#map').show();
	$('#mode_toggle').bootstrapToggle('on');
	$('#search_condition').show();	
	
	$.blockUI({ message: '<div>讀取中 !</div>'});

	/*****
		import from docusky
	*****/ 
	var xml_content = docuSkyObj.docList;	
	/*
		parse string to shared model format
	 */
	// for parser
	var xmlDoc, title, xml_parser;
	xml_parser = new DOMParser();
	// for docusky data
	var data_content = [];
	var data_header = [];
	var cell_str, docinfo;
	var header_flag=0, header_index=0, content_index=0, content_flag=0;
	data_content[0] = [];
	data_content[1] = [];
	for(var i=0; i<xml_content.length; i++)
	{
		docinfo = xml_content[i]['docInfo'];
		data_content[content_index+2] = [];
		for(var key in docinfo)
		{
			if(key == 'docContentXml')
			{
				cell_str = docinfo[key];
				xmlDoc = xml_parser.parseFromString(cell_str, 'text/xml');
				var c = xmlDoc.getElementsByTagName("Cell");

				for(var j=0; j<c.length; j++)
				{
					// for data header
					if(c[j].getAttribute('attr') != 'sID' && header_flag == 0)
						data_header[header_index++] = c[j].getAttribute('attr');
					
					// for data content
					if(c[j].getAttribute('attr') != 'sID')
					{
						if(i==0)
						{						
							data_content[content_index].push(c[j].getAttribute('attr'));						
						}
						else if(i==1)
						{						
							data_content[content_index].push(c[j].getAttribute('Name'));
						}
						
						data_content[content_index+2].push(c[j].childNodes[0].nodeValue);						
					}
					
					// data_content[i].push
				}
				header_flag = 1;
				
			}
		}
		
		content_index++;
	}

	var data_result = share_model.getInput(data_content, data_header);
			
	// delay 1 sec for block msg (temp)
	setTimeout(function(){
		$(document).trigger('data_start');
		$.unblockUI();
	}, 1000);
	
}

function downloadFile(filename, text)
{
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);

}