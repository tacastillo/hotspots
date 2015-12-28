var userCoords = { latitude: 37.77460802950839, longitude: -122.44795115356442}
var heatMapData = [];
var map, heatmap;
var marker;
var infoWindow = null;

var zoomToMeters = {};


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
    detectBrowser();

    var isDoubleClick = null;

	// $(document).ready(function() {
	// 	if (document.URL.indexOf("#access_token=") < 0) {
	// 		$('#sign-in').text("Sign In Via Foursquare");
	// 	} else {
	// 		$('#sign-in').text("Authorization Accepted");
	// 		var access_token = document.URL.substring(document.URL.indexOf("=")+1);
			// console.log(userCoords);
			Foursquare.init({
				// access_token: access_token,
				coords: userCoords
			});
	// 	}
	// });

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
        zoom: 14
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

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

    function closeInfoWindow() {
		marker.setVisible(false);
    }

    function openInfoWindow(latLng, map) {
    	var coords = {latitude: latLng.lat(), longitude: latLng.lng()};
    	var content = "";

    	Foursquare.explore(function(results) {
    		if (results.meta.errorType) {
    			alert("Oh no! something bad happened when running explore()");
    			return;
    		}

			var response = results.response;
			var root_url = "http://www.foursquare.com/v/";
			var locations = response.groups[0].items;
			var venue;

			content += "<ul>";
			locations.forEach(function(place) {
				venue = place.venue;
				console.log("enters: " + venue.name);
				users = venue.stats.usersCount;
				content += "<li>"
					+ venue.name
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
    	}, coords, 5, 100);
    }

    map.addListener('dragend', function() {
    	var center = map.getCenter();
    	Foursquare.updateCoords({latitude: center.lat(), longitude: center.lng()});
    	heatMapData.length = 0;

	    Foursquare.explore(updateHeatmap);
	});

	map.addListener('click', function(e) {
		isDoubleClick = setTimeout(function() {
			openInfoWindow(e.latLng, map);
		}, 200);
	});

	map.addListener('dblclick', function() {
		clearTimeout(isDoubleClick);
	});

	infoWindow.addListener('closeclick', function() {
		marker.setVisible(false);
	});

	Foursquare.explore(updateHeatmap);
}