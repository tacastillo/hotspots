window.Foursquare = {
	/**
	 * Stores Application Credentials
	 */
	BASE_URL: "https://api.foursquare.com/v2/",
	VERSION: "&v=20151226",
	MEDIUM: "&m=foursquare",
	SECRET: 'UVIHPYFW31ZVFN0A32RYP1W0GUKCNU3YNY34QXFKVSDGWEHP',
	ID: 'DNKYBONOXMOGCBLFTLQ253CUROP3WCHGOASHRPWCPS5NMPEI',

	config: {},

	init: function(options) {
		options = options || {};
		// this.config.access_token = options.access_token;
		this.config.coords =  options.coords || {latitude: 37.757815, longitude: -122.5076404};
	},

	updateCoords: function(coords) {
		this.config.coords = coords;
	},

	explore: function(callback, userOptions) {
		/* ENDPOINT: https://api.foursquare.com/v2/venues/explore?...=... */
		var options = userOptions || {};
		var searchArea = options.coords || this.config.coords;
		var limit = options.maxResults ? "&limit=" + options.maxResults : "";
		var radius = options.maxDistance ? "&radius=" + options.maxDistance : "";

		console.log("coords: " + searchArea);
		console.log("Radius: " + radius);

		var endpoint = this.BASE_URL + 'venues/explore?ll=' 
			+ searchArea.latitude +',' + searchArea.longitude 
			// + '&oauth_token=' + this.config.access_token
			+ limit + radius
			+ '&client_id=' + this.ID
			+ '&client_secret=' + this.SECRET
			+ this.VERSION + this.MEDIUM; 
		this.getJSON(endpoint, callback);
	},

	getJSON: function(url, callback){
		$.ajax({
			type: "GET",
			url: url,
			dataType: "jsonp",
			success: function(res) {
				if (typeof callback === "function")
					callback(res);
			}
		});
	}
};