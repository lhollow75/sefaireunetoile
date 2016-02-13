var map;
var marker;
var myLatLng;
var startPos;
var elt_autocomplete = document.getElementById('autocomplete');
var elt_geolocalisation = document.getElementById('geolocaliseMoi');

elt_autocomplete.addEventListener("focus", geolocate);
elt_geolocalisation.addEventListener("click", geolocalisation);
	  
	  
function geolocalisation() {
  
  var geoSuccess = function(position) {
    startPos = position;
	// console.log(startPos.coords.latitude+" / "+ startPos.coords.longitude);
	initMap(startPos.coords.latitude, startPos.coords.longitude);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
  // console.log(position);
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

var autocomplete;


function geolocate() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(elt_autocomplete),
      {types: ['geocode']});

  console.log(autocomplete);
  
  google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            // console.log(place.name);
            // console.log(place.geometry.location.lat());
            // console.log(place.geometry.location.lng());
			initMap(place.geometry.location.lat(), place.geometry.location.lng());
        });
}