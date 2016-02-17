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
var nb_pages;

elt_autocomplete.addEventListener("focus", geolocate);
elt_geolocalisation.addEventListener("click", geolocalisation);
elt_movie.addEventListener("keyup", movieFinder);
elt_chercher.addEventListener("click", recherche);


// Lance la récupération de la liste des films dès la chargement de la page
recup_liste_films_en_salle();

function affiche_tab(){
	console.log(tab_filmsEnSalle);
}

function recherche(){
	initMap(latitude, longitude);
}

// Géolocalise l'utilisateur à partir des données du navigateur
function geolocalisation() {
  elt_autocomplete.value = "Ma position";
  var geoSuccess = function(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	// console.log(startPos.coords.latitude+" / "+ startPos.coords.longitude);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
  // console.log(position);
  console.log(latitude+"/"+longitude);
};

// Affichage de la map et du marqueur de position en fonction de la géolocalisation ou de l'adresse tapée
function initMap(latitude, longitude) {
	myLatLng = {lat: latitude, lng: longitude}
	
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: latitude, lng: longitude},
	  zoom: 15
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
	console.log(latitude+"/"+longitude);
	
}

// Lance la recherche du film dans la tableau à chaque ajout d'une lettre
function movieFinder(){
	$('li').remove();
	if (elt_movie.value.length >= 3){
		recherche = traitementChaine(elt_movie.value);
		// console.log(recherche);
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
			$("#movie_list").append(template(titre_film, id_film));
			document.getElementById(id_film).addEventListener('click', afficheFilm);
			fin++;
		}
	}
	return -1;
}

function afficheFilm(film){
	movie.value = film.toElement.innerHTML;
	$('li').remove();
}

// Affichage des films
var template = function(list, id){
	var _tpl = [
		'<li>',
			'<span id="'+id+'">'+list+'</span>',
		'</li>'
	]
	return _tpl.join('');
}

// Appel à l'api allociné pour récupérer le nombre de pages de films en salle
function recup_liste_films_en_salle(){
	var allocine_api = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&format=json";
	$.getJSON(allocine_api, recup_liste);
}

// Appel à l'api allociné en fonction du nombre de page
function recup_liste(recup_movie){
	console.log(recup_movie.feed);
	
	if (recup_movie.feed.totalResults > 0) {
		nb_pages = Math.ceil(recup_movie.feed.totalResults/10);
		
		for(var j=1; j<= nb_pages; j++){	
			var allocine_api_page = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&format=json&page="+j;
			$.getJSON(allocine_api_page, recup_liste_films);
		}
	}
}

// Récupère sur chaque page la liste de film et l'ajoute dans le tableau tab_filmsEnSalle
function recup_liste_films(recup_film){
	for(var k=0; k< recup_film.feed.movie.length; k++){
		// console.log(typeof recup_film.feed.movie[k].keywords);
		if (recup_film.feed.movie[k].keywords != undefined ) {
			tab_filmsEnSalle.push(recup_film.feed.movie[k].code+";"+recup_film.feed.movie[k].keywords);
		} else if (recup_film.feed.movie[k].originalTitle != "Mise à jour sur Google play" ){
			tab_filmsEnSalle.push(recup_film.feed.movie[k].code+";"+recup_film.feed.movie[k].originalTitle);
		}		
	}
}