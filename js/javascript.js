var map;
var marker;
var myLatLng;
var startPos;
var elt_autocomplete = document.getElementById('autocomplete');
var elt_geolocalisation = document.getElementById('geolocaliseMoi');
var elt_movie = document.getElementById('movie');
var elt_chercher = document.getElementById('chercher');
var elt_movie_list = document.getElementById('movie_list');
var google_search_api = "http://suggestqueries.google.com/complete/search?client=firefox&q=";
var key_allocine = "YW5kcm9pZC12Mg";
var tab_filmsEnSalle = [];
var tab_filmsSansNom = [];
var tab_split = [" Bande-annonce"," - BANDE-ANNONCE", " Teaser", " TEASER", " - EXTRAIT", " - Extrait", " Extrait"];
var nb_pages;
var film_recent=0;
var k;

elt_autocomplete.addEventListener("focus", geolocate);
elt_geolocalisation.addEventListener("click", geolocalisation);
elt_movie.addEventListener("keyup", movieFinder);
elt_chercher.addEventListener("click", recherche);

document.getElementById('section2').style.display="block";
document.getElementById('section3').style.display="none";
// document.getElementById('section4').style.display="none";
document.getElementById('section5').style.display="none";

// Lance la récupération de la liste des films dès la chargement de la page
recup_liste_films_en_salle();

// Initialisation de la carte lors du clique sur le bouton recherche
function recherche(){
	geolocalisation();
	
	// Récupération des cinémas aux alentours
	var api_allocine_cinema = "http://api.allocine.fr/rest/v3/theaterlist?partner="+key_allocine+"&count=5&page=1&lat="+latitude+"&long="+longitude+"&format=json&radius=5";
	$.getJSON(api_allocine_cinema, recup_liste_cinema);
	
	initMap(latitude, longitude);
	document.getElementById('section2').style.display="none";
	document.getElementById('section3').style.display="block";
	if (document.getElementById('movie').value != "") {
		// console.log(document.getElementById('movie').value);
		document.getElementById('section5').style.display="block";
	} else {
		document.getElementById('section4').style.display="block";
	}
}

function recup_liste_cinema(liste_cinema){
	console.log(liste_cinema.feed);
	for (var c = 0; c < liste_cinema.feed.totalResults, c < liste_cinema.feed.count; c++){
		nom = liste_cinema.feed.theater[c].name;
		myLatLng = {lat: liste_cinema.feed.theater[c].geoloc.lat, lng: liste_cinema.feed.theater[c].geoloc.long};
		marker = new google.maps.Marker({
			position: myLatLng,
			label: (c+1).toString(),
			map: map,
			title: nom
		});
		var infowindow = new google.maps.InfoWindow({
			content: nom
		});
		marker.addListener('click', function() {
			infowindow.open(map, marker);
		});
	}
}

// Géolocalise l'utilisateur à partir des données du navigateur
function geolocalisation() {
  elt_autocomplete.value = "Ma position";
  var geoSuccess = function(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
};

// Affichage de la map et du marqueur de position en fonction de la géolocalisation ou de l'adresse tapée
function initMap(latitude, longitude) {
	myLatLng = {lat: latitude, lng: longitude}
	
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: latitude, lng: longitude},
	  zoom: 14
	});
		
	marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Carte'
	});
}

var autocomplete;



// Autocomplete l'adresse lorsqu'on la tape
function geolocate() {
	  autocomplete = new google.maps.places.Autocomplete(
		  /** @type {!HTMLInputElement} */(elt_autocomplete),
		  {types: ['geocode']});

  
	google.maps.event.addListener(autocomplete, 'place_changed', function () {
		var place = autocomplete.getPlace();
		latitude = place.geometry.location.lat();
		longitude = place.geometry.location.lng();
		// initMap(place.geometry.location.lat(), place.geometry.location.lng());
	});
	// console.log(latitude+"/"+longitude);
	
}

// Lance la recherche du film dans la tableau à chaque ajout d'une lettre
function movieFinder(){
	$(".movie-results").remove();
	if (elt_movie.value.length >= 2){
		recherche = traitementChaine(elt_movie.value);
		searchStringInArray(recherche,tab_filmsEnSalle);	
	}
}

// Enlève les accents et les majuscules pour la comparaison
function traitementChaine(chaine){
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
     
    for(var i = 0; i < accent.length; i++){
        chaine = chaine.replace(accent[i], noaccent[i]);
    }
     
    return chaine.toLowerCase();
}

// Recherche le titre dans le tableau des films en salle
function searchStringInArray (str, strArray) {
	fin=0;
	for (var j=0; j<strArray.length && fin<=10; j++) {
		if (traitementChaine(strArray[j]).match(str)){
			index_film = j;
			trouve = tab_filmsEnSalle[index_film].split(";");
			titre_film = trouve[1];
			id_film = trouve[0];
			// console.log(id_film);
			// console.log(titre_film);
			
			$("#movie_list").append(template(titre_film, id_film));
			document.getElementById(id_film).addEventListener('click', afficheFilm);
			fin++;
		}
	}
	return -1;
}

// Affiche le film dans le champs de recherche en fonction de l'endroit cliqué
function afficheFilm(film){
	if (film.toElement.innerHTML == ""){
		film = film.srcElement.alt;
	} else {
		film = film.toElement.innerHTML;
	}
	movie.value = film;
	$(".movie-results").remove();
}

// Affichage des films
var template = function(list, id){
	var _tpl = [
		'<li class="movie-results">',
			'<span id="'+id+'">'+list+'</span>',
		'</li>'
	]
	return _tpl.join('');
}

// Appel à l'api allociné pour récupérer le nombre de pages de films en salle
function recup_liste_films_en_salle(){
	var allocine_api = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&format=json&order=datedesc";
	$.getJSON(allocine_api, recup_liste);
}

// Appel à l'api allociné en fonction du nombre de page
function recup_liste(recup_movie){
	// console.log(recup_movie.feed);
	
	if (recup_movie.feed.totalResults > 0) {
		nb_pages = Math.ceil(recup_movie.feed.totalResults/10);
		
		for(var j=1; j<= nb_pages; j++){	
			var allocine_api_page = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&order=datedesc&format=json&page="+j;
			$.getJSON(allocine_api_page, recup_liste_films);
		}
	}
}

// Récupère sur chaque page la liste de film et l'ajoute dans le tableau tab_filmsEnSalle
function recup_liste_films(recup_film){
	for(k=0; k< recup_film.feed.movie.length; k++){	
		film_recent++;
		film = splitNom(recup_film.feed.movie[k].defaultMedia.media.title);
		
		code_film = recup_film.feed.movie[k].code;
		tab_filmsEnSalle.push(code_film+";"+film);
		
		if (film_recent<6){
			synopsisShort = recup_film.feed.movie[k].synopsisShort;
			pressRate = (Math.round(recup_film.feed.movie[k].statistics.pressRating * 2)*0.5)*10;
			userRate = (Math.round(recup_film.feed.movie[k].statistics.userRating * 2)*0.5)*10;

			// Affichage des éléments du film
			document.getElementById('titre'+film_recent).innerHTML = film;
			document.getElementById('affiche'+film_recent).alt = film;
			document.getElementById('synopsis'+film_recent).innerHTML = synopsisShort;
			document.getElementById('note-presse'+film_recent).className = "note-presse note-"+pressRate;
			document.getElementById('note-spectateurs'+film_recent).className = "note-spectateurs note-"+userRate;
			document.getElementById('affiche'+film_recent).addEventListener('click', afficheFilm);
			
			var allocine_api_recherche = "http://api.allocine.fr/rest/v3/movie?partner="+key_allocine+"&code="+code_film+"&profile=large&format=json";
			(function(fr){ $.getJSON(allocine_api_recherche, function(d){ recup_info_films(d, fr) }); })(film_recent)
		}
	}
}


function recup_info_films(recup_info, fr){
	document.getElementById('affiche'+fr).src = recup_info.movie.media[0].thumbnail.href;
}

// Récupère le nom du film dans le titre de la Bande-annonce
function splitNom(titre){
	var trouve = 0;
	for (n=0; n < tab_split.length && trouve == 0; n++){
		tab_decoupe_film = titre.split(tab_split[n]);
		if (tab_decoupe_film.length > 1) trouve = 1;
	}
	return tab_decoupe_film[0];
}