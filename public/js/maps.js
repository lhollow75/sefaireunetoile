var elt_geolocalisation = document.getElementById('geolocaliseMoi');
elt_geolocalisation.addEventListener("click", geolocalisation);
elt_chercher.addEventListener("click", recherche);

// Initialisation de la carte lors du clique sur le bouton recherche
function recherche(){
	
	// Si on clique sur la recherche sans avoir entré de localisation, lance la géolocalisation
	if (elt_autocomplete.value == ""){
		geolocalisation();
	}

	// Récupération des cinémas aux alentours
	var api_allocine_cinema = "http://api.allocine.fr/rest/v3/theaterlist?partner="+key_allocine+"&count=5&page=1&lat="+latitude+"&long="+longitude+"&format=json&radius=5";
	$.getJSON(api_allocine_cinema, recup_liste_cinema);
	
	initMap(latitude, longitude);
	document.getElementById('section2').style.display="none";
	document.getElementById('section3').style.display="block";
}


// Geolocates user based on the navigator position
function geolocalisation() {
  elt_autocomplete.value = "Ma position";
  var geoSuccess = function(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
};


// Display the map and the user's position's marker/ address he choose
function initMap(latitude, longitude) {
	myLatLng = {lat: latitude, lng: longitude}

	// Creation of the map
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: latitude, lng: longitude},
	  zoom: 14
	});
		
	// Creation of the marker
	var img = 'static/img/location_me.png';
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Carte',
		icon: img
	});
}