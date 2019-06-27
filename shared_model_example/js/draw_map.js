$(document).on("data_start", function(event){
	// var input = share_model.data;
	// console.log(share_model.data['data_category']);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	initMap(post_result['data']);
});

$(document).on("data_edit", function(event, input){
	// var input = share_model.data;
	if(typeof(input) != 'undefined')
		share_model.editData(input);
	var post_result = share_model.post_classify(share_model.data['data_category']);
	initMap(post_result['data']);
});

$(document).on("data_filter", function(event, input){

	var state = share_model.state;
	var result_arr = share_model.getResult(input);
	console.log('result arr:');
	console.log(result_arr);

	// NOT mode
	// if(mode == 1)
	// 	result_arr = share_model.getNotResult(result_arr);	

	
	if(state == true)
	{	
		var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);		
		initMap(post_result['data']);
	}
	else
	{
		var post_result = share_model.post_classify(share_model.data_tmp);
		// console.log(share_model.data_tmp);
		initMap(post_result['data'],result_arr, input);
	}
		// var post_result = share_model.post_classify(share_model.data_tmp);
});

$(document).on("data_search", function(event, input){
	var result_arr = share_model.getResult(input);
	var post_result = share_model.post_classify(share_model.data['data_category'], result_arr);
	initMap(post_result['data']);
});

function initMap(input, filter = '', filter_condititon)
{
		
		// reset map
		$('#map').html('');
		// if no lat, lng, place, users can not use this.
		if(!input['lat'] || !input['lng'] || !input['place']) return;

		var marker = [];
		var info = [];
		var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var icons = ['dot', 'star', 'square', 'circle'];
		var color = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];
		var content, length, judge;

		// 
		var highlight_type;
		var highlight_tags;
		if(typeof(filter_condititon) != 'undefined')
		{
			for(key in filter_condititon.val)
				highlight_type = key;
			highlight_tags = filter_condititon.content;
		}
		// calculate 一開始的經緯度
		var lat_avg=0, lng_avg=0;
		var latlng = [];
		for(var i=0; i<input['lat'].length; i++)
		{
			lat_avg += Number(input['lat'][i].content);
			latlng.push(new google.maps.LatLng(input['lat'][i].content, input['lng'][i].content))
		}
		lat_avg = lat_avg / input['lat'].length;

		for(var i=0; i<input['lng'].length; i++)
		{
			lng_avg += Number(input['lng'][i].content);
		}
		lng_avg = lng_avg / input['lng'].length;

		// intitial google map
		var uluru = {lat: lat_avg, lng: lng_avg};
		var map = new google.maps.Map(document.getElementById('map'), 
		{
			zoom: 7,
			center: uluru
		});



		// auto zoom
		var latlngbounds = new google.maps.LatLngBounds();
		for(var i=0; i<latlng.length; i++)
			latlngbounds.extend(latlng[i]);
		if(latlng.length>1)		//超過一個點才autozoom
			map.fitBounds(latlngbounds);

		var icon_flag = 0;

		if(input['lat'].length > input['lng'].length)
		{
			length = input['lat'].length;
			judge = 'lat';
		}
		else
		{
			length = input['lng'].length;
			judge = 'lng';
		}

		var content_lat, content_lng, marker_tmp;
		var content_place = '';
		var marker_ind = 0;
		var category = [];
		var marker_data = [];

		for(var i=0; i<length; i++)
		{
			// 存取lat, lng, place
			for(var j=0; j<share_model.data_tmp.length; j++)
			{
				if(judge == 'lat')
				{
					if(input['lat'][i].content == share_model.data_tmp[j]['lat'])
					{
						if(typeof(share_model.data_tmp[j]['place']) != 'undefined')
							content_place = share_model.data_tmp[j]['place'];
						content_lat = share_model.data_tmp[j]['lat'];
						content_lng = share_model.data_tmp[j]['lng'];
						break;
					}
				}
				else
				{
					if(input['lng'][i].content == share_model.data_tmp[j]['lng'])
					{
						if(typeof(share_model.data_tmp[j]['place']) != 'undefined')
							content_place = share_model.data_tmp[j]['place'];
						content_lat = share_model.data_tmp[j]['lat'];
						content_lng = share_model.data_tmp[j]['lng'];
						break;
					}
				}
			}
			// icon_flag 用來判斷marker是否是符合條件的
			icon_flag = 0;
			
			for(var j=0; j<share_model.data_tmp.length; j++)
			{
				if(judge == 'lat')
				{
					if(input['lat'][i].content == share_model.data_tmp[j]['lat'])
					{					
						if(filter.includes(Number(share_model.data_tmp[j]['sID'])))
						{
							icon_flag = 1;
							
							// 同種type設定同顏色							
							if(category.length == 0){
								category.push(share_model.data_tmp[j][highlight_type]);
							}							
							else if(!category.includes(share_model.data_tmp[j][highlight_type]))
							{
								category.push(share_model.data_tmp[j][highlight_type]);								
							}
							marker_ind = category.indexOf(share_model.data_tmp[j][highlight_type]);
							break;
						}
					}	
				}
				else
				{
					if(input['lng'][i].content == share_model.data_tmp[j]['lng'])
					{
						if(filter.includes(Number(share_model.data_tmp[j]['sID'])))
						{
							icon_flag = 1;
							
							// 同種type設定同顏色
							var ca_type = typeof(share_model.data_tmp[j][highlight_type]);
							var ca_input;
							if(ca_type == 'string'){
								ca_input = share_model.data_tmp[j][highlight_type];								
							}
							else{
								ca_input = share_model.data_tmp[j][highlight_type][0];
								
							}

							if(category.length == 0)
							{
								category.push(ca_input);
							}
							else if(!category.includes(ca_input))
							{
								category.push(ca_input);
							}
																					
							// console.log(category);
							marker_ind = category.indexOf(ca_input);

							
							break;
						}
					}
				}								
			}
			
			if(icon_flag == 0)
			{				
				marker[i] = new google.maps.Marker({
					position: {lat: Number(content_lat), lng: Number(content_lng)},
					// label: labels[i],
					map: map,
					// icon: 'js/img/star.png'
					icon: 'js/img/'+icons[0]+'_'+color[0]+'.png'
				});				
			}

			// for highlight
			else
			{
				
				
				marker[i] = new google.maps.Marker({
					position: {lat: Number(content_lat), lng: Number(content_lng)},
					// label: labels[i],
					map: map,
					icon: 'js/img/'+icons[0]+'_'+color[marker_ind+1]+'.png'
					
				});				
				
			}			

			var content_listener = [content_place, content_lat, content_lng];
			marker_data.push(content_listener);

			google.maps.event.addListener(marker[i], 'click', (function(marker,content,infowindow)
				{
					return function()
					{
						// infowindow.setContent(content);
						// infowindow.open(map, marker);

						// var icon = marker.getIcon();
						// if(icon == 'http://maps.google.com/mapfiles/ms/micons/green-dot.png')
						// 	marker.setIcon('http://maps.google.com/mapfiles/ms/micons/red-dot.png');
						// else
						// 	marker.setIcon('http://maps.google.com/mapfiles/ms/micons/green-dot.png');
						
						var value = {};
						var type;

						// for place
						if(content[0] != '')
						{
							type = 'place';
							value[type] = [];
							value[type].push(content[0]);
						}
						// lat, lng
						else
						{		
							type = 'lat';
							value['lat'] = [];
							value['lng'] = [];
							value['lat'].push(content[1]);
							value['lng'].push(content[2]);
						}

						var result = [{source: 'map', val: value, type: 'equal', content: content}];
						share_model.getFilterCondition(result);

						// $(this).unbind('click');

						// console.log(share_model.condition);
						$(document).trigger('data_filter', share_model.condition);
						
					};
				}
			)(marker[i], content_listener, marker[i].infowindow));

			// add info window to every marker
			if(content_place.length > 0)
			{
				marker[i].infowindow = new google.maps.InfoWindow({
					content: content_place
				});
				google.maps.event.addListener(marker[i], 'mouseover', (function(marker,content,infowindow)
					{
						return function()
						{						
							infowindow.setContent(content);
							infowindow.open(map, marker);
						};
					}
				)(marker[i], content_place, marker[i].infowindow));

				google.maps.event.addListener(marker[i], 'mouseout', (function(marker,content,infowindow)
					{
						return function()
						{							
							infowindow.close();
						};
					}
				)(marker[i], content_place, marker[i].infowindow));
			}
		}	

		/*****
		drawing manager 
		*****/
		var drawingManager = new google.maps.drawing.DrawingManager({
			// drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions:{
				position:google.maps.ControlPosition.TOP_CENTER,
				drawingModes:['polygon']
			}
		});
		drawingManager.setMap(map);	
		/* get polygon bounds */		
		if (!google.maps.Polygon.prototype.getBounds) {
			google.maps.Polygon.prototype.getBounds = function () {
				var bounds = new google.maps.LatLngBounds();
				this.getPath().forEach(function (element, index) { bounds.extend(element); });
				return bounds;
			}
		}
		google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon){
			// console.log(polygon.getPath());
			// var bounds = polygon.getBounds();
			var count = 0;
			console.log(marker_data);
			var value = {};			
			var poly_content = [];
			var type = 'place';

			value[type] = [];
			// find markers inside polygon
			for(var i=0; i<marker.length; i++)
			{
				if(google.maps.geometry.poly.containsLocation(marker[i].getPosition(),polygon))
				{
					count++;

					// for place
					if(marker_data[i][0] != '')
					{						
						value[type].push(marker_data[i][0]);
						poly_content.push(marker_data[i][0]);
					}
					// lat, lng
					// else
					// {		
					// 	type = 'lat';
					// 	value['lat'] = [];
					// 	value['lng'] = [];
					// 	value['lat'].push(marker_data[i][1]);
					// 	value['lng'].push(marker_data[i][2]);
					// }				
				}
			}
			
			if(count > 0)
			{
				var result = [{source: 'map', val: value, type: 'equal', content: poly_content}];
				share_model.getFilterCondition(result);
				// $(this).unbind('click');

				console.log(share_model.condition);
				$(document).trigger('data_filter', share_model.condition);	
			}
			
		})
}