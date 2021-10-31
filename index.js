mapboxgl.accessToken = 'pk.eyJ1IjoiMjA0MjI3MyIsImEiOiJja21zMmdsbW8wZHRkMndzMWRtNW55NWowIn0.cuMJNvU1uR_Tth7Aul-uMQ';

function myFunction() {
    location.replace("newLocation.html")
}

let succeed = function(position) {
    var map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
        center: [position.coords.longitude, position.coords.latitude], // Starting position [lng, lat]
        zoom: 12 // Starting zoom level
    });

    var marker = new mapboxgl.Marker() // Initialize a new marker
        .setLngLat([position.coords.longitude, position.coords.latitude]) // Marker [lng, lat] coordinates
        .addTo(map); // Add the marker to the map

    var geocoder = new MapboxGeocoder({
        // Initialize the geocoder
        accessToken: mapboxgl.accessToken, // Set the access token
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

    loadSheet();


    // create a function to make a directions request
    function getRoute(end) {
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
                        'line-color': '#3887be',
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
                tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
                instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min 🚴 </span>' + tripInstructions;
            }
        };
        req.send();
		
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
                        'line-color': '#3887be',
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
                tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
                instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min 🚴 </span>' + tripInstructions;
            }
        };
        req.send();
		
    }


    // create a function to make a directions request
    function loadSheet() {
        // make a directions request using cycling profile
        // an arbitrary start will always be the same
        // only the end or destination will change
        //var start = deviceLocation;

        var url = 'https://api.apispreadsheets.com/data/16127/';
        console.log(url);
        // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            var json = JSON.parse(request.response);

            //console.log(location);

            /*   var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }; */
            //console.log(geojson);
            /*   map.addSource('location',{
			type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
		  });
           
            map.addLayer({
              id: 'newLocation',
              type: 'circle',
              source: 'location',
              paint: {
				'circle-radius': 100,
				'circle-color': '#B42222'
              }
            }); */



            for (var i = 0; i < json.data.length; i++) {

                var lng = json.data[i].lng;
                var lat = json.data[i].lat;
             /*    var marker2 = new mapboxgl.Marker() // Initialize a new marker
                    .setLngLat([lng, lat]) // Marker [lng, lat] coordinates
                    .addTo(map); // Add the marker to the map */
            }
            console.log("what is happening here");
            /* var data = json.routes[0];
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
                  'line-color': '#3887be',
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
              tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
              instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min 🚴 </span>' + tripInstructions;
            } */
        };
        request.send();
    }



    // After the map style has loaded on the page,
    // add a source layer and default styling for a single point
    map.on('load', function() {
        //loadSheet();
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
        //  Add a marker at the result's coordinates
        geocoder.on('result', function(e) {
            map.getSource('single-point').setData(e.result.geometry);
            console.log(e.result.geometry);
            //var coordsObj = e.lngLat;
            //console.log(coordsObj);//getting undefined
            // canvas.style.cursor = '';
            // var coords = Object.keys(coordsObj).map(function(key) {
            //   return coordsObj[key];
            //   });
            var coords = [e.result.geometry.coordinates[0], e.result.geometry.coordinates[1]];
            console.log(coords);
            // make an initial directions request that
            // starts and ends at the same location
            console.log("after getting geocoding result");
            getRoute(deviceLocation);
            console.log(deviceLocation);
            // Add starting point to the map
            // map.addLayer({
            //   id: 'device',
            //   type: 'circle',
            //   source: {
            //     type: 'geojson',
            //     data: {
            //     type: 'FeatureCollection',
            //     features: [{
            //       type: 'Feature',
            //       properties: {},
            //       geometry: {
            //       type: 'Point',
            //       coordinates: deviceLocation
            //       }
            //     }
            //     ]
            //     }
            //   },
            //   paint: {
            //     'circle-radius': 10,
            //     'circle-color': '#3887be'
            //   }
            //   });

            // var coordsObj = e.lngLat;
            // console.log(coordsObj);
            // // canvas.style.cursor = '';
            // // var coords = Object.keys(coordsObj).map(function(key) {
            // //   return coordsObj[key];
            // //   });
            // var coords = [e.longitude,e.latitude]
            var end = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
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
                                properties: {},
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
            getRoute(coords);

        });

    });


    map.on('click', function(e) {
        console.log('A click event has occurred on a visible portion of the poi-label layer at ' + e.lngLat);
    });
};
navigator.geolocation.getCurrentPosition(succeed, console.log);
