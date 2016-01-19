function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    } else { 
        alert("If you don't allow location service, default will be San Francisco.");
    }
}
function success(position) {
  var positionInfo = position.coords;
  x = positionInfo.latitude;
  y = positionInfo.longitude;
  var geocoder = new google.maps.Geocoder;
	function getLocationZipcode(geocoder) {
	  var latlng = {lat: x, lng: y};
	  geocoder.geocode({'location': latlng}, function(results, status) {
	  	zipCode = results[0].address_components[6].short_name;
	  	localStorage.setItem("zipCode", zipCode);
	    localStorage.setItem("latitude", x);
	    localStorage.setItem("longitude", y);
	  });
	}
	getLocationZipcode(geocoder);
}