var map;
var marker;
var myLatLng;
	  
	  
window.onload = function() {
  var startPos;
  var geoSuccess = function(position) {
    startPos = position;
	console.log(startPos.coords.latitude+" / "+ startPos.coords.longitude);
	initMap(startPos.coords.latitude, startPos.coords.longitude);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
  console.log(position);
};

function initMap(latitude, longitude) {
	myLatLng = {lat: latitude, lng: longitude}
	
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: latitude, lng: longitude},
	  zoom: 15
	});
		
	marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Hello World!'
	});
}