var elt_geolocalisation = document.getElementById('geolocaliseMoi');
elt_geolocalisation.addEventListener("click", geolocalisation);
elt_chercher.addEventListener("click", recherche);
latitude = longitude = undefined;

// Initialisation de la carte lors du clique sur le bouton recherche
function recherche(){
	// Choice of the parcours (1: without movie; 2: with a movie)
	if (current_movie == undefined || document.getElementById('movie').value == "") parcours = 1; else parcours = 2;
	
	// console.log("current_movie: "+current_movie);
	// console.log("movie: "+document.getElementById('movie').value);
	// console.log("parcours: "+parcours);
	
	// Si on clique sur la recherche sans avoir entré de localisation, lance la géolocalisation
	if (elt_autocomplete.value == "" || elt_autocomplete.value == "Ma position"){
		geolocalisation();
	}
	
	

	setTimeout(function() {
		console.log("lat/long: "+latitude+"/"+longitude);
		if (latitude != undefined && longitude != undefined){
			// Récupération des cinémas aux alentours
			if (parcours == 1){
				var api_allocine_cinema = "http://api.allocine.fr/rest/v3/theaterlist?partner="+key_allocine+"&count=5&page=1&lat="+latitude+"&long="+longitude+"&format=json&radius=5";
				$.getJSON(api_allocine_cinema, recup_liste_cinema);
			} else {
				var api_allocine_cinema = "http://api.allocine.fr/rest/v3/showtimelist?partner="+key_allocine+"&format=json&count=5&radius=50&lat="+latitude+"&long="+longitude+"&movie="+current_movie;
				$.getJSON(api_allocine_cinema, collect_movies_theater);
			}

			initMap(latitude, longitude);
			document.getElementById('section2').style.display="none";
			document.getElementById('section3').style.display="block";
		} else {
			
		}
	}, 1000);
	
	
}


// Geolocates user based on the navigator position
function geolocalisation() {
	console.log("geolocalisation");
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