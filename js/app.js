var userCoords = { latitude: 37.77460802950839, longitude: -122.44795115356442}
var heatMapData = [];
var map, heatmap;
var marker;
var infoWindow = null;
var range;
var search;

var zoomToMeters = {
	'19m': 30,
	'18m': 60,
	'17m': 140,
	'16m': 300,
	'15m': 700,
	'14m': 1500,
	'13m': 3000,
	'12m': 6000,
	'11m': 12000,
};


function detectBrowser() {
	var useragent = navigator.userAgent;
	// var mapdiv = $("#map").get(0);
	var $map = $('#map');

	if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
		$map.width("100%");
    	$map.height("100%");
	} else {
    	$map.width("100%");
    	$map.height("80%");
  	}
}

function init() {
	if (navigator.geolocation) {
		function error(err) { console.warn('ERROR(' + err.code + '): ' + err.message); 
			initMap();
		}
		function success(pos) {
			userCoords = pos.coords;
			initMap();
		}
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		alert('Geolocation is not supported in your browser');
		initMap();
	}
}

function initMap() {
    var isDoubleClick = null;

	Foursquare.init({
		coords: userCoords
	});

    detectBrowser();

    var mapOptions = {
        mapTypeControl: true,
        streetViewControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
        },
        center: {
            lat: userCoords.latitude,
            lng: userCoords.longitude
        },
        zoom: 15
    };

    map = new google.maps.Map($('#map').get(0), mapOptions);

    marker = new google.maps.Marker({
    	map: map,
    });

    infoWindow = new google.maps.InfoWindow({
		content: "Placeholder",
		maxWidth: 300
	});

    heatmap = new google.maps.visualization.HeatmapLayer({
		radius: 40
	});
    // <input id="search" class="interface" type="text" placeholder="Enter a Location...">
    var search = $('<input>', {
    	"class": "interface",
    	"id": "search",
    	"type": "text",
    	"placeholder": "Enter a Location"
    }).get(0);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(search);
    var autocomplete = new google.maps.places.Autocomplete(search);
    autocomplete.bindTo('bounds', map);

    function closeInfoWindow() {
		marker.setVisible(false);
    }

    function openInfoWindow(latLng, map) {
    	var coords = {latitude: latLng.lat(), longitude: latLng.lng()};
    	var content = "";

    	var options = {
    		coords: coords, 
    		maxResults: 5, 
    		maxDistance: 100
    	}

    	Foursquare.explore(function(results) {
    		if (results.meta.errorType) {
    			alert("Oh no! something bad happened when running explore()");
    			return;
    		}

			var response = results.response;
			var root_url = "http://www.foursquare.com/v/";
			var locations = response.groups[0].items;
			var venue;

			content += "<ul class='no-bullet' style='list-style-type: none;'>";
			locations.forEach(function(place) {
				venue = place.venue;
				users = venue.stats.usersCount;
				content += "<li><div><h3>"
					+ venue.name
					+ "</h3><i>"
					+ (venue.rating !== undefined ? venue.rating : "No Rating Provided")
					+ "</i></div>"
					+ "</li>"
			});

			if (content.indexOf("<li>") < 0) {
				content += "<li>It's not very lit here.</li>";
			}

			content += "</ul>";

			infoWindow.setContent(content);
			marker.setPosition(latLng);
			marker.setVisible(true);
			infoWindow.open(map, marker);
    	}, options);
    }

    map.addListener('dragend', function() {
    	var center = map.getCenter();
    	Foursquare.updateCoords({latitude: center.lat(), longitude: center.lng()});
    	heatMapData.length = 0;

	    Foursquare.explore(updateHeatmap, {maxDistance: range});
	});

	map.addListener('click', function(e) {
		isDoubleClick = setTimeout(function() {
			openInfoWindow(e.latLng, map);
		}, 300);
	});

	map.addListener('dblclick', function() {
		clearTimeout(isDoubleClick);
	});

	infoWindow.addListener('closeclick', function() {
		marker.setVisible(false);
	});

	autocomplete.addListener('place_changed', function() {
	    var place = autocomplete.getPlace();
	    var distance;
	    if (!place.geometry) {
	      return;
	    }

	    if (place.geometry.viewport) {
	      map.fitBounds(place.geometry.viewport);
	    } else {
	      map.setCenter(place.geometry.location);
	      map.setZoom(17);
	      distance = 150;
	    }

	    var center = map.getCenter();
    	Foursquare.updateCoords({latitude: center.lat(), longitude: center.lng()});
    	heatMapData.length = 0;

	    Foursquare.explore(updateHeatmap, {maxDistance: distance});
	});


	function updateHeatmap(results) {
   		if (results.meta.errorType) {
    			alert("Oh no! something bad happened when running explore()");
    			return;
		}

		var response = results.response;
		var root_url = "http://www.foursquare.com/v/";
		var locations = response.groups[0].items;
		var venue, lat, lng;
		var average, sum = 0, count = 0;
		var users, weightedUsers;

		locations.forEach(function(place) {
			count++;
			// return total + place.venue.stats.usersCount;
			sum += place.venue.stats.usersCount;
		});
		average = sum/count;

		locations.forEach(function(place) {
			venue = place.venue;
			lat = venue.location.lat;
			lng = venue.location.lng;
			users = venue.stats.usersCount;
			weightedUsers = users/average;
			if (lat && lng) {
				heatMapData.push({location: new google.maps.LatLng(lat, lng), weight: weightedUsers});
			}
		});

		heatmap.setData(heatMapData);
		heatmap.setMap(map);
    }


	// range = zoomToMeters[oldZoom + 'm'] || 24000;
	Foursquare.explore(updateHeatmap);
}