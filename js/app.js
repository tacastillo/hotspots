var $map = $('#map');
var userCoords = { latitude: 37.77460802950839, longitude: -122.44795115356442}
var heatMapData = [];

function detectBrowser() {
	var useragent = navigator.userAgent;
	var mapdiv = document.getElementById("map");

	if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
 		mapdiv.style.width = '100%';
		mapdiv.style.height = '100%';
	} else {
		mapdiv.style.width = '100%';
    	mapdiv.style.height = '80%';
  	}
}

function initMap() {
    // detectBrowser();

	// $(document).ready(function() {
	// 	if (document.URL.indexOf("#access_token=") < 0) {
	// 		$('#sign-in').text("Sign In Via Foursquare");
	// 	} else {
	// 		$('#sign-in').text("Authorization Accepted");
	// 		var access_token = document.URL.substring(document.URL.indexOf("=")+1);
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
        zoom: 13
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var heatmap = new google.maps.visualization.HeatmapLayer({
		radius: 25
	});

    function updateHeatmap(results) {
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
			// console.log("Average for " + venue.name + " is: " + weightedUsers);
			if (lat && lng) {
				heatMapData.push({location: new google.maps.LatLng(lat, lng), weight: weightedUsers});
			}
		});

		heatmap.setData(heatMapData);
		heatmap.setMap(map);
    };

    Foursquare.explore(updateHeatmap);

    map.addListener('dragend', function() {
    	var center = map.getCenter();
    	Foursquare.updateCoords({latitude: center.lat(), longitude: center.lng()});

    	heatmap.setMap(null);
    	heatMapData.length = 0;
	    Foursquare.explore(updateHeatmap);
	});
}

function init() {
	if (navigator.geolocation) {
		function error(err) { console.warn('ERROR(' + err.code + '): ' + err.message); 
			initMap();
		}
		function success(pos) {
			// userCoords = pos.coords;
			initMap();
		}
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		alert('Geolocation is not supported in your browser');
		initMap();
	}
}