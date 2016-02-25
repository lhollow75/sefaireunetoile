var map;
var marker;
var myLatLng;
var startPos;
var elt_autocomplete = document.getElementById('autocomplete');
var elt_geolocalisation = document.getElementById('geolocaliseMoi');
var elt_movie = document.getElementById('movie');
var elt_chercher = document.getElementById('chercher');
var elt_movie_list = document.getElementById('movie_list');
var elt_listFilmEnSalle = document.getElementById('listFilmEnSalle');
var key_allocine = "YW5kcm9pZC12Mg";
var tab_filmsEnSalle = [];
var tab_split = [" Bande-annonce"," - BANDE-ANNONCE", " Teaser", " TEASER", " - EXTRAIT", " - Extrait", " Extrait"];
var nb_pages;
var film_recent=0;
var k;
var position;
var bounds;
var firstGeneration = false;

var tab_seances = [];
var tab_rates = [];

elt_autocomplete.addEventListener("focus", geolocate);
elt_geolocalisation.addEventListener("click", geolocalisation);
elt_movie.addEventListener("keyup", movieFinder);
elt_chercher.addEventListener("click", recherche);


// Hide all sections beside the search bar
document.getElementById('section2').style.display="block";
document.getElementById('section3').style.display="none";
document.getElementById('section4').style.display="none";
document.getElementById('section5').style.display="none";
document.getElementById('section6').style.display="none";
document.getElementById('section7').style.display="none";
document.getElementById('section8').style.display="none";
// document.getElementById('chatroom').style.display="none";


// Lance la récupération de la liste des films dès la chargement de la page
recup_liste_films_en_salle();

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


// Return today's date (format: YYYY-MM-DD) 
function getTodaysDate(){
	var ladate = new Date();
	// ladate.getDate()+"/"+(ladate.getMonth()+1)+"/"+ladate.getFullYear()
	year = ladate.getFullYear();
	month = (ladate.getMonth()+1<10 ? '0' : '')+(ladate.getMonth()+1);
	day = ladate.getDate()<10 ? '0' : ''+ladate.getDate();
	ladate = year+"-"+month+"-"+day;
	return ladate;
}

// Return true if the date in parameter is today's date
function isTodaysDate(date){
	todaysDate = getTodaysDate();
	if (todaysDate == date){
		return true;
	} else return false;
}

// Put theaters around the address on the map
function recup_liste_cinema(liste_cinema){
	bounds = new google.maps.LatLngBounds();
	
	// console.log(liste_cinema.feed);
	for (var c = 0; ((c < liste_cinema.feed.totalResults) && (c < liste_cinema.feed.count)) ; c++){
		// console.log(c);
		nom = liste_cinema.feed.theater[c].name;
		
		
		// Showing of the markers
		myLatLng = {lat: liste_cinema.feed.theater[c].geoloc.lat, lng: liste_cinema.feed.theater[c].geoloc.long};
		position = new google.maps.LatLng(myLatLng);
		bounds.extend(position);
		marker = new google.maps.Marker({
			position: myLatLng,
			label: (c+1).toString(),
			map: map,
			title: nom
		});
		
		// Add information's card into the marker with we click on it
		address = liste_cinema.feed.theater[c].address
		code = liste_cinema.feed.theater[c].code
		city = liste_cinema.feed.theater[c].city
		contenu = "<div id= 'theaterName"+c+"'>"+nom+"</div><div id= 'theaterAddress"+c+"'>"+address+"</div><div id= 'theaterCity"+c+"'>"+city+"</div><div id= 'theaterCode"+c+"' valeur = '"+code+"'></div>";
		
		// Show informations in infowindow
		var infoWindow = new google.maps.InfoWindow(), marker, c;
		google.maps.event.addListener(marker, 'click', (function(marker, _c, _code) {
			
            return function() {
                infoWindow.setContent(_c);
                infoWindow.open(map, marker);
				$(".en-salle").remove();
				document.getElementById('section4').style.display="block";
				document.getElementById('section5').style.display="none";
				var api_allocine_rechercheFilmSalle = "http://api.allocine.fr/rest/v3/showtimelist?partner="+key_allocine+"&q=&format=json&theaters="+_code;
				$.getJSON(api_allocine_rechercheFilmSalle, recup_horaire_cinema);
            }
        })(marker, contenu, code));
	}
	map.fitBounds(bounds);
}

// Collect movie's showtimes
function recup_horaire_cinema(horaires){
	var tab_moviesList = [];
	var noMovies = true;
	// console.log(horaires.feed.theaterShowtimes[0]);
	showtimes = horaires.feed.theaterShowtimes[0];

	if (showtimes.movieShowtimes != undefined){
		
		// Look all the movies showing in the theater
		for (h=0; h < showtimes.movieShowtimes.length; h++){

			onShow = showtimes.movieShowtimes[h].onShow.movie;

			// console.log(showtimes.movieShowtimes[h]);
			
			// Show the informations only if there is showtimes on today's date
			if (isTodaysDate(showtimes.movieShowtimes[h].scr[0].d)){ 
				// Show the informations only if we haven't show them yet --> giving up for now
				// if (tab_moviesList.indexOf(onShow.code) == -1){
					
					$("#listFilmEnSalle").append(template_filmEnSalle(onShow.code, onShow.title, onShow.poster.href, VOVF(showtimes.movieShowtimes[h].version), num3d(showtimes.movieShowtimes[h].screenFormat.$)));
					
					(function(donnees){
						document.getElementById('filmEnSalle'+onShow.code).addEventListener('click', function(){
							document.getElementById('section5').style.display="block";
							$(".showtime-btn").remove();
							movieCard(donnees);
						});
					})(showtimes.movieShowtimes[h])
					
					tab_moviesList.push(onShow.code);
					noMovies = false;
				// } 
			}
		}
	}
	
	// If noMovies is style true, there is no movies in this theater today so the title change
	if (noMovies){
		document.getElementById('filmEnSalle').innerHTML = "Pas de films dans ce cinéma aujourd'hui";
		// console.log("Pas de films dans ce cinéma aujourd'hui");
	} else {
		document.getElementById('filmEnSalle').innerHTML = "Sélectionnez un film actuellement en salle";
	}
	
}

// Return the language version of the movie (VF or VOST)
function VOVF(code){
	console.log(code);
	langue = code.$;
	original = code.original;

	if (original == "false") return "VF";
		else return "V0ST";
}

// Return if the movie is 3D or digital (return " " in this case)
function num3d(code){
	if (code == "Numérique") return " ";
		else return "3D";
}

// Show all the informations about a movie when click on the poster
function movieCard(donnees){
	
	console.log(donnees);
	_donnees = donnees;
	seances = donnees.scr[0];
	donnees = donnees.onShow.movie;
	
	document.getElementById('movieTitle').innerHTML = donnees.title;
	
	// If there is no rate, show a ligne
	if (donnees.statistics.pressRating != undefined){
		document.getElementById('pressRate').className = "note-presse note-"+rateClass(donnees.statistics.pressRating);
	}
	if (donnees.statistics.userRating != undefined){
		document.getElementById('userRate').className = "note-spectateurs note-"+rateClass(donnees.statistics.userRating);
	} else document.getElementById('userRate').className = "";
	
	
	if (donnees.trailer.href != undefined){
		document.getElementById('movieTrailer').href = donnees.trailer.href;
	} else document.getElementById('movieTrailer').visibility = "hidden";
	
	if (donnees.trailer.href != undefined){
		document.getElementById('director').innerHTML = donnees.castingShort.directors;
	} else document.getElementById('director').innerHTML = "Non Renseigné";
	
	if (donnees.castingShort.actors != undefined){
		document.getElementById('actors').innerHTML = donnees.castingShort.actors;
	} else document.getElementById('actors').innerHTML = "Non Renseigné";
	
	if (donnees.poster.href != undefined){
		document.getElementById('moviePicture').src = donnees.poster.href;
	} else document.getElementById('moviePicture').src = "static/img/affiches/nan.png";
	
	document.getElementById('movieVersion').innerHTML = _donnees.screenFormat.$;
	document.getElementById('movieFormat').innerHTML = VOVF(_donnees.version);
	
	
	
	// Collect showtime's informations
	tab_seances = [];
	// console.log("longueur: "+seances.t.length);
	for (s=0; s<seances.t.length; s++){
		// console.log(seances.t[s].$);
		$("#showtimesList").append(template_showtimes(seances.t[s].code, seances.t[s].$));
		tab_seances.push(seances.t[s].code);
		
		(function(donnees){
			document.getElementById('showtime-'+donnees).addEventListener('click', function(){
				console.log(firstGeneration);
				
				if (!firstGeneration){
					var numrooms = tab_seances.length;
					// console.log(numrooms);
					socket.emit('generaterooms', numrooms);
					socket.emit('adduser', prompt("Quel est votre nom ?"));
					socket.emit('roomchoice', donnees);
					firstGeneration = true;
				} else {
					switchRoom(donnees);
				}
				
				
			});
		})(seances.t[s].code)
	}
	console.log(tab_seances);
	//socket.emit('addingkeyroom',tab_seances);
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
		// console.log(tab_rates.length);
		// console.log(tab_filmsEnSalle.length);
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

// Retourn la note arrondie à 0.5 près pour la mettre dans une classe
function rateClass(rate){
	return (Math.round(rate * 2)*0.5)*10;
}

// Récupère sur chaque page la liste de film et l'ajoute dans le tableau tab_filmsEnSalle
function recup_liste_films(recup_film){
	for(k=0; k< recup_film.feed.movie.length; k++){	
		film_recent++;
		// console.log(recup_film.feed.movie[k]);
		
		if ((recup_film.feed.movie[k].defaultMedia != undefined) && (recup_film.feed.movie[k].defaultMedia.media.title != undefined)) {
			film = splitNom(recup_film.feed.movie[k].defaultMedia.media.title);
			
			code_film = recup_film.feed.movie[k].code;
			tab_filmsEnSalle.push(code_film+";"+film);
			
			if (film_recent<6){

				// Affichage des éléments du film
				document.getElementById('titre'+film_recent).innerHTML = film;
				document.getElementById('affiche'+film_recent).alt = film;
				document.getElementById('synopsis'+film_recent).innerHTML = recup_film.feed.movie[k].synopsisShort;
				document.getElementById('note-presse'+film_recent).className = "note-presse note-"+rateClass(recup_film.feed.movie[k].statistics.pressRating);
				document.getElementById('note-spectateurs'+film_recent).className = "note-spectateurs note-"+rateClass(recup_film.feed.movie[k].statistics.userRating);
				document.getElementById('affiche'+film_recent).addEventListener('click', afficheFilm);
				document.getElementById('b-a'+film_recent).href= recup_film.feed.movie[k].trailer.href;
				
				var allocine_api_recherche = "http://api.allocine.fr/rest/v3/movie?partner="+key_allocine+"&code="+code_film+"&profile=large&format=json";
				(function(fr){ $.getJSON(allocine_api_recherche, function(d){ showMoviePicture(d, fr) }); })(film_recent)
			}	
		} else {
			tab_rates.push(recup_film.feed.movie[k].code);
		}
		
	}
}

// Place l'affiche du film
function showMoviePicture(recup_info, fr){
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