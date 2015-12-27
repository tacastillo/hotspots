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

	explore: function(callback) {
		/* ENDPOINT: https://api.foursquare.com/v2/venues/explore?...=... */
		var coords = this.config.coords;
		var endpoint = this.BASE_URL + 'venues/explore?ll=' 
			+ coords.latitude +',' + coords.longitude 
			// + '&oauth_token=' + this.config.access_token
			+ '&limit=50'
			+ '&client_id=' + this.ID
			+ '&client_secret=' + this.SECRET
			+ this.VERSION + this.MEDIUM; 
		this.getJSON(endpoint, callback);
	},

	getJSON: function(url, callback){
		console.log(url);
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