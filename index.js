mapboxgl.accessToken = 'pk.eyJ1IjoiMjA0MjI3MyIsImEiOiJja21zMmdsbW8wZHRkMndzMWRtNW55NWowIn0.cuMJNvU1uR_Tth7Aul-uMQ';

function myFunction() {
    location.replace("newLocation.html")
}

let succeed = function(position) {

		// Function to load spredsheet crowdsourced data to supplement the search results
		function loadSheet(url, callback) {
			// var url = 'https://api.apispreadsheets.com/data/16127/';
			console.log(url);
			// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.onload = function() {
				setTimeout(function() {
				var json = JSON.parse(request.response);
				console.log(json);
				var jsonFeatures = '[';
				for (var i = 0; i < json.data.length; i++) {
					var lng = json.data[i].lng;
					var lat = json.data[i].lat;
					var address = json.data[i].location;
					var opening_times = json.data[i].opening_times;
					var waiting_time = json.data[i].waiting_time;
					var category = json.data[i].category;
					var jsonFeature = '{ "type": "Feature", "properties":' + '{' + '"address": ' +'"' + address +'"' + ','+ '"category": ' +'"' + category +'"' + ',' + '"opening_times": ' +'"' + opening_times +'"' + ',' + '"waiting_time": ' +'"' + waiting_time +'"'+ 
									'},' + '"geometry": '+  '{'+ '"coordinates": [' + lng + ',' + lat + '],' + 
                        '"type": "Point"' + '}' + '}';	
					
					if (i ==0) 	
						jsonFeatures = jsonFeatures + jsonFeature;
					else
						jsonFeatures = jsonFeatures + ','+jsonFeature;
				}
				jsonFeatures = jsonFeatures + ']';
				return callback(jsonFeatures)
				 }, 1000);
				
				console.log("what is happening here");
			};
			request.send();
		}
		
		loadSheet('https://api.apispreadsheets.com/data/16127/', function(response) {
			console.log(response);
			var map = new mapboxgl.Map({
				container: 'map', // Container ID
				style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
				center: [position.coords.longitude, position.coords.latitude], // Starting position [lng, lat]
				zoom: 12 // Starting zoom level
			});

			var marker = new mapboxgl.Marker() // Initialize a new marker
				.setLngLat([position.coords.longitude, position.coords.latitude]) // Marker [lng, lat] coordinates
				.addTo(map); // Add the marker to the map
				// Load new locations data to supplement the search results.			
					
			const customData = {
				//'features': [{ "type": "Feature", "properties":{"title": "Brunswick street"},"geometry": {"coordinates": [-3.95415699429142,51.6141729222217],"type": "Point"}},{ "type": "Feature", "properties":{"title": "St James"},"geometry": {"coordinates": [-3.96056624274024,51.6188000832027],"type": "Point"}},{ "type": "Feature", "properties":{"title": "Tesco Uplands"},"geometry": {"coordinates": [-3.96726682760007,51.6179092653681],"type": "Point"}},{ "type": "Feature", "properties":{"title": "My Swansea Castle"},"geometry": {"coordinates": [-3.94110363974635,51.6203000753989],"type": "Point"}},{ "type": "Feature", "properties":{"title": "jersy castle"},"geometry": {"coordinates": [-3.89349854668674,51.6255665292029],"type": "Point"}},{ "type": "Feature", "properties":{"title": "fabina port"},"geometry": {"coordinates": [-3.91772649983204,51.6224931033815],"type": "Point"}},{ "type": "Feature", "properties":{"title": "st thomos"},"geometry": {"coordinates": [,],"type": "Point"}},{ "type": "Feature", "properties":{"title": "st thomos"},"geometry": {"coordinates": [,],"type": "Point"}},{ "type": "Feature", "properties":{"title": "my castle"},"geometry": {"coordinates": [,],"type": "Point"}}],
				'features': JSON.parse(response),
				'type': 'FeatureCollection'
			};
			
			var geocoder = new MapboxGeocoder({
				// Initialize the geocoder
				accessToken: mapboxgl.accessToken, // Set the access token
				localGeocoder: forwardGeocoder,
				mapboxgl: mapboxgl, // Set the mapbox-gl instance
				marker: false, // Do not use the default marker style
				placeholder: 'Search for places', // Placeholder text for the search bar
				//bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary
				proximity: {
					longitude: position.coords.longitude,
					latitude: position.coords.latitude
				} // Coordinates of current location
			});


			// Add the geocoder to the map
			map.addControl(geocoder);

			map.addControl(new mapboxgl.GeolocateControl({
				positionOption: {
					enableHighAccuracy: true
				},
				trackUserLocation: true
			}));

			// Add zoom and rotation controls to the map.
			map.addControl(new mapboxgl.NavigationControl());

			// initialize the map canvas to interact with later
			var canvas = map.getCanvasContainer();

			//Start of the user location

			var deviceLocation = [position.coords.longitude, position.coords.latitude];
			
			function forwardGeocoder(query) {
				const matchingFeatures = [];
				console.log(customData);
				for (const feature of customData.features) {
					// Handle queries with different capitalization
					// than the source data by calling toLowerCase().
					if (
						feature.properties.address
						.toLowerCase()
						.includes(query.toLowerCase())
					) {
						// Add a tree emoji as a prefix for custom
						// data results using carmen geojson format:
						// https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
						feature['place_name'] = `🌲 ${feature.properties.address}`;
						feature['center'] = feature.geometry.coordinates;
						feature['place_type'] = ['park'];
						matchingFeatures.push(feature);
					}
				}
				return matchingFeatures;
			}

			// create a function to make a directions request
			function getRouteWalking(end) {
				// make a directions request using walking profile
				// an arbitrary start will always be the same
				// only the end or destination will change
				var start = deviceLocation;

				var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
				console.log(url);
				// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
				var req = new XMLHttpRequest();
				req.open('GET', url, true);
				req.onload = function() {
					var json = JSON.parse(req.response);
					var data = json.routes[0];
					var route1 = data.geometry.coordinates;
					var geojson = {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: route1
						}
					};
					// if the route1 already exists on the map, reset it using setData
					if (map.getSource('route1')) {
						map.getSource('route1').setData(geojson);
					} else { // otherwise, make a new request
						map.addLayer({
							id: 'route1',
							type: 'line',
							source: {
								type: 'geojson',
								data: {
									type: 'Feature',
									properties: {},
									geometry: {
										type: 'LineString',
										coordinates: geojson
									}
								}
							},
							layout: {
								'line-join': 'round',
								'line-cap': 'round'
							},
							paint: {
								'line-color': 'green',
								'line-width': 5,
								'line-opacity': 0.75
							}
						});
					}
					// add turn instructions here at the end
					// get the sidebar and add the instructions
					var instructions = document.getElementById('instructions');
					var steps = data.legs[0].steps;

					var tripInstructions = [];
					for (var i = 0; i < steps.length; i++) {
						tripInstructions.push('<br> <li > ' + steps[i].maneuver.instruction) + ' < /li>';
					}
					instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min By <span style="color:green">Walking</span> </span>' + tripInstructions;
				};
				req.send();

			}

			function getRouteCycling(end) {
				// make a directions request using cycling profile
				// an arbitrary start will always be the same
				// only the end or destination will change
				var start = deviceLocation;

				var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
				console.log(url);
				// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
				var req = new XMLHttpRequest();
				req.open('GET', url, true);
				req.onload = function() {
					var json = JSON.parse(req.response);
					var data = json.routes[0];
					var route2 = data.geometry.coordinates;
					var geojson = {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: route2
						}
					};
					// if the route2 already exists on the map, reset it using setData
					if (map.getSource('route2')) {
						map.getSource('route2').setData(geojson);
					} else { // otherwise, make a new request
						map.addLayer({
							id: 'route2',
							type: 'line',
							source: {
								type: 'geojson',
								data: {
									type: 'Feature',
									properties: {},
									geometry: {
										type: 'LineString',
										coordinates: geojson
									}
								}
							},
							layout: {
								'line-join': 'round',
								'line-cap': 'round'
							},
							paint: {
								'line-color': 'olive',
								'line-width': 5,
								'line-opacity': 0.75
							}
						});
					}
					// add turn instructions here at the end
					// get the sidebar and add the instructions
					var instructions = document.getElementById('instructions');				
					var steps = data.legs[0].steps;

					var tripInstructions = [];
					for (var i = 0; i < steps.length; i++) {
						tripInstructions.push('<br> <li > ' + steps[i].maneuver.instruction) + ' < /li>';
					}
				   
					var newcontent = document.createElement('div1');
							newcontent.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min by <span style="color:olive">Cycling</span></span>' + tripInstructions;
					while (newcontent.firstChild) {
						instructions.appendChild(newcontent.firstChild);
					}
				};
				req.send();

			}

			function getRouteDriving(end) {
				// make a directions request using cycling profile
				// an arbitrary start will always be the same
				// only the end or destination will change
				var start = deviceLocation;

				var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
				console.log(url);
				// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
				var req = new XMLHttpRequest();
				req.open('GET', url, true);
				req.onload = function() {
					var json = JSON.parse(req.response);
					var data = json.routes[0];
					var route = data.geometry.coordinates;
					var geojson = {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: route
						}
					};
					// if the route already exists on the map, reset it using setData
					if (map.getSource('route')) {
						map.getSource('route').setData(geojson);
					} else { // otherwise, make a new request
						map.addLayer({
							id: 'route',
							type: 'line',
							source: {
								type: 'geojson',
								data: {
									type: 'Feature',
									properties: {},
									geometry: {
										type: 'LineString',
										coordinates: geojson
									}
								}
							},
							layout: {
								'line-join': 'round',
								'line-cap': 'round'
							},
							paint: {
								'line-color': 'fuchsia',
								'line-width': 5,
								'line-opacity': 0.75
							}
						});
					}
					// add turn instructions here at the end
					// get the sidebar and add the instructions
					var instructions = document.getElementById('instructions');				
					var steps = data.legs[0].steps;

					var tripInstructions = [];
					for (var i = 0; i < steps.length; i++) {
						tripInstructions.push('<br> <li > ' + steps[i].maneuver.instruction) + ' < /li>';
					}
								
					var newcontent = document.createElement('div2');
							newcontent.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min by <span style="color:fuchsia">Driving</span></span>' + tripInstructions;
					while (newcontent.firstChild) {
						instructions.appendChild(newcontent.firstChild);
					}
				};
				req.send();

			}


			// After the map style has loaded on the page,
			// add a source layer and default styling for a single point
			map.on('load', function() {
				map.addSource('single-point', {
					'type': 'geojson',
					'data': {
						'type': 'FeatureCollection',
						'features': []
					}
				});

				map.addLayer({
					'id': 'point',
					'source': 'single-point',
					'type': 'circle',
					'paint': {
						'circle-radius': 10,
						'circle-color': '#448ee4'
					}
				});

				// Listen for the `result` event from the Geocoder // `result` event is triggered when a user makes a selection
				// Add a marker at the result's coordinates
				geocoder.on('result', function(e) {
					map.getSource('single-point').setData(e.result.geometry);
					console.log(e.result);
					
					var coords = [e.result.geometry.coordinates[0], e.result.geometry.coordinates[1]];
					console.log(coords);
					// make an initial directions request that
					// starts and ends at the same location
					console.log("after getting geocoding result");
					getRouteWalking(deviceLocation);
					
					console.log(deviceLocation);
					
					var end = {
						type: 'FeatureCollection',
						features: [{
							type: 'Feature',
							properties: {
								address: e.result.properties.address,
								category: e.result.properties.category,
								opening_times: e.result.properties.opening_times,
								waiting_time: e.result.properties.waiting_time
							},
							geometry: {
								type: 'Point',
								coordinates: coords
							}
						}]
					};
					if (map.getLayer('end')) {
						map.getSource('end').setData(end);
					} else {
						map.addLayer({
							id: 'end',
							type: 'circle',
							source: {
								type: 'geojson',
								data: {
									type: 'FeatureCollection',
									features: [{
										type: 'Feature',
										properties: {
											address: e.result.properties.address,
											category: e.result.properties.category,
											opening_times: e.result.properties.opening_times,
											waiting_time: e.result.properties.waiting_time
										},
										geometry: {
											type: 'Point',
											coordinates: coords
										}
									}]
								}
							},
							paint: {
								'circle-radius': 10,
								'circle-color': '#f30'
							}
						});
					}
					getRouteWalking(coords);
					getRouteCycling(coords);			
					getRouteDriving(coords);

				});

				// When a click event occurs on a feature in the end layer, open a popup at the
				// location of the feature, with description HTML from its properties.
				map.on('click', 'end', (e) => {
					// Copy coordinates array.
					var coordinates = e.features[0].geometry.coordinates.slice();
					const waiting_time = e.features[0].properties.waiting_time;
					const opening_times = e.features[0].properties.opening_times;
					const address = e.features[0].properties.address;
					const category = e.features[0].properties.category;
					var description = `<h3>` + e.features[0].properties.address + `</h3>` + `<h4>` + `<b>` + `Category: ` + `</b>` + e.features[0].properties.category + `</h4>`+ `<h4>` + `<b>` + `Opening Times: ` + `</b>` + e.features[0].properties.opening_times + `</h4>` + `<h4>` + `<b>` + `Waiting Time: ` + `</b>` + e.features[0].properties.waiting_time + `</h4>`;

					// Ensure that if the map is zoomed out such that multiple
					// copies of the feature are visible, the popup appears
					// over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}
					console.log(customData);
					new mapboxgl.Popup()
						.setLngLat(coordinates)
						.setHTML(description)
						.addTo(map);
				});

				// Change the cursor to a pointer when the mouse is over the end layer.
				map.on('mouseenter', 'end', () => {
					map.getCanvas().style.cursor = 'pointer';
				});

				// Change it back to a pointer when it leaves.
				map.on('mouseleave', 'end', () => {
					map.getCanvas().style.cursor = '';
				});
			});

			/* map.on('click', function(e) {
				console.log('A click event has occurred on a visible portion of the poi-label layer at ' + e.lngLat);
			});  */
			
		});
	};
	navigator.geolocation.getCurrentPosition(succeed, console.log);
