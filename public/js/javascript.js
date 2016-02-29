var map;
var marker;
var myLatLng;
var startPos;
var elt_autocomplete = document.getElementById('autocomplete');
var current_movie;
var elt_movie = document.getElementById('movie');
var elt_chercher = document.getElementById('chercher');
var elt_movie_list = document.getElementById('movie_list');
var elt_listFilmEnSalle = document.getElementById('listFilmEnSalle');
var key_allocine = "YW5kcm9pZC12Mg";
var tab_filmsEnSalle = [];
var tab_thisWeeksRelease = [];
var parcours = 1;
var nb_pages;
var film_recent=0;
var position;
var bounds;
var firstGeneration = false;
var fin = false;
var tab_seances = [];
var tab_rates = [];
var lastRelease;
var tabIsOk = true;
elt_autocomplete.addEventListener("focus", geolocate);

elt_movie.addEventListener("keyup", movieFinder);





// Lance la récupération de la liste des films dès la chargement de la page
recup_liste_films_en_salle();


// Put theaters around the address on the map
function recup_liste_cinema(liste_cinema){
	bounds = new google.maps.LatLngBounds();
	

	for (var c = 0; ((c < liste_cinema.feed.totalResults) && (c < liste_cinema.feed.count)) ; c++){

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
				$('body').scrollTo('#section3',{duration:'fast'});

				var api_allocine_rechercheFilmSalle = "http://api.allocine.fr/rest/v3/showtimelist?partner="+key_allocine+"&q=&format=json&theaters="+_code;
				$.getJSON(api_allocine_rechercheFilmSalle, recup_horaire_cinema);
            }
        })(marker, contenu, code));
	}
	map.fitBounds(bounds);

}

function collect_movies_theater(infos){
	bounds = new google.maps.LatLngBounds();

	var atLeastOne = false;
	// Liste tous les cinémas
	for (t=0; t<infos.feed.theaterShowtimes.length; t++){
		var flag = 0;

		cinema = infos.feed.theaterShowtimes[t];
		
		// Liste des salles de cinémas
		for (s=0; s<cinema.movieShowtimes.length; s++){
			if (isTodaysDate(cinema.movieShowtimes[s].scr[0].d)){
				flag = 1;
				atLeastOne = true;
			}
		}
		if (flag ==1){
			
				// Showing of the markers
			myLatLng = {lat: cinema.place.theater.geoloc.lat, lng: cinema.place.theater.geoloc.long};
			position = new google.maps.LatLng(myLatLng);
			bounds.extend(position);
			nom = cinema.place.theater.name;
			marker = new google.maps.Marker({
				position: myLatLng,
				label: (t+1).toString(),
				map: map,
				title: nom
			});
			
			// Add information's card into the marker with we click on it
			address = cinema.place.theater.address
			code = cinema.place.theater.code
			city = cinema.place.theater.city
			contenu = "<div id= 'theaterName"+t+"'>"+nom+"</div><div id= 'theaterAddress"+t+"'>"+address+"</div><div id= 'theaterCity"+t+"'>"+city+"</div><div id= 'theaterCode"+t+"' valeur = '"+code+"'></div>";
			
			// Show informations in infowindow
			var infoWindow = new google.maps.InfoWindow(), marker, c;
			google.maps.event.addListener(marker, 'click', (function(marker, _c, _code, id) {
				
				return function() {
					infoWindow.setContent(_c);
					infoWindow.open(map, marker);
					$(".en-salle").remove();
					document.getElementById('section4').style.display="block";
					document.getElementById('section5').style.display="none";
					//vincent
					$('body').scrollTo('#section4',{duration:'slow', offsetTop : '150'});
					var api_allocine_rechercheFilmSalle = "http://api.allocine.fr/rest/v3/showtimelist?partner="+key_allocine+"&q=&format=json&movie="+id+"&theaters="+_code;
					$.getJSON(api_allocine_rechercheFilmSalle, recup_horaire_cinema);
				}
			})(marker, contenu, code, current_movie));
	
		}
	}
	if (atLeastOne){
		map.fitBounds(bounds);
		document.getElementById("select-theater").innerHTML= "Ces cinémas passent votre film près de chez vous";
	} else {
		document.getElementById("select-theater").innerHTML= "Aucun cinéma à proximité ne passe le film choisi";
	}
	
}

// Collect movie's showtimes
function recup_horaire_cinema(horaires){
	var tab_moviesList = [];
	var noMovies = true;
	showtimes = horaires.feed.theaterShowtimes[0];

	if (showtimes.movieShowtimes != undefined){
		
		// Look all the movies showing in the theater
		for (h=0; h < showtimes.movieShowtimes.length; h++){

			onShow = showtimes.movieShowtimes[h].onShow.movie;

			
			// Show the informations only if there is showtimes on today's date
			if (isTodaysDate(showtimes.movieShowtimes[h].scr[0].d)){ 
				// Show the informations only if we haven't show them yet --> giving up for now
				// if (tab_moviesList.indexOf(onShow.code) == -1){
					console.log(onShow);
					$("#listFilmEnSalle").append(template_filmEnSalle(onShow.code, onShow.title, onShow.poster.href, VOVF(showtimes.movieShowtimes[h].version), showtimes.movieShowtimes[h].screenFormat.$));
					
					(function(donnees, langue, format){

						document.getElementById('filmEnSalle'+donnees.onShow.movie.code+'-'+langue+'-'+format).addEventListener('click', function(){
							document.getElementById('section5').style.display="block";
							$('body').scrollTo('#section5',{duration:'slow'});
							$(".showtime-btn").remove();
							movieCard(donnees);
							document.getElementById('chosenMovieSynospis').innerHTML = "";
						});
					})(showtimes.movieShowtimes[h], VOVF(showtimes.movieShowtimes[h].version), showtimes.movieShowtimes[h].screenFormat.$)
					
					tab_moviesList.push(onShow.code);
					noMovies = false;
				// } 
			}
		}
	}
	
	// If noMovies is still true, there is no movies in this theater today so the title change
	if (noMovies){
		document.getElementById('filmEnSalle').innerHTML = "Pas de films dans ce cinéma aujourd'hui";
	} else {
		document.getElementById('filmEnSalle').innerHTML = "Sélectionnez un film actuellement en salle";
	}
	
}

// Show all the informations about a movie when click on the poster
function movieCard(donnees){
	
	_donnees = donnees;
	seances = donnees.scr[0];
	donnees = donnees.onShow.movie;
	
	document.getElementById('movieTitle').innerHTML = donnees.title;
	
	// If there is no rate, show a ligne
	document.getElementById('pressRate').className = "note-presse note-"+rateClass(donnees.statistics.pressRating);
	document.getElementById('userRate').className = "note-spectateurs note-"+rateClass(donnees.statistics.userRating);
	
	
	if (donnees.trailer.href != undefined){
		document.getElementById('movieTrailer').href = donnees.trailer.href;
	} else document.getElementById('movieTrailer').visibility = "hidden";
	
	if (donnees.castingShort != undefined){
		if (donnees.castingShort.directors != undefined){
			document.getElementById('director').innerHTML = donnees.castingShort.directors;
		} else document.getElementById('director').innerHTML = "Non Renseigné";
	
		if (donnees.castingShort.actors != undefined){
			document.getElementById('actors').innerHTML = donnees.castingShort.actors;
		} else document.getElementById('actors').innerHTML = "Non Renseigné";
	} else {
		document.getElementById('director').innerHTML = "Non Renseigné";
		document.getElementById('actors').innerHTML = "Non Renseigné";
	}
	
	if (donnees.poster.href != undefined){
		poster = donnees.poster.href;
	} else poster = "static/img/affiches/nan.png";
	document.getElementById('moviePicture').src = poster;
	document.getElementById('movieVersion').innerHTML = _donnees.screenFormat.$;
	document.getElementById('movieFormat').innerHTML = VOVF(_donnees.version);
	
	var allocine_api_recherche = "http://api.allocine.fr/rest/v3/movie?partner="+key_allocine+"&code="+donnees.code+"&profile=medium&format=json";
	$.getJSON(allocine_api_recherche, showSynopsis);
	
	// Collect showtime's informations
	tab_seances = [];
	for (s=0; s<seances.t.length; s++){
		$("#showtimesList").append(template_showtimes(seances.t[s].code, seances.t[s].$));
		tab_seances.push(seances.t[s].code);
		
		(function(id, title, showtime, poster){
			document.getElementById('showtime-'+id).addEventListener('click', function(){
				document.getElementById('chatroom').style.display="block";
                var messages = document.getElementById("zone_chat");

				if (!firstGeneration){
					var numrooms = tab_seances.length;
					socket.emit('generaterooms', numrooms);
					socket.emit('adduser', prompt("Quel est votre nom ?"));
					socket.emit('roomchoice', id);
					firstGeneration = true;
				} else {
                    numrooms = tab_seances.length;
                    socket.emit('generaterooms', numrooms);
                    messages.innerHTML = '';
					socket.emit('switchRoom', id);
				}
				
				document.getElementById('chat-movie-title').innerHTML = title;
				document.getElementById('chat-movie-schedule').innerHTML = "<span class="+"icon-schedule-pin"+"></span> "+showtime;
				document.getElementById('chat-movie-poster').src = poster;
				document.getElementById('chat-movie-poster').alt = title;
				
			});
		})(seances.t[s].code, donnees.title, seances.t[s].$, poster)
	}
}


// Display Synopsis of the movie into the movie's card
function showSynopsis(movieData){
	movieData = movieData.movie;
	if (movieData.synopsis != undefined){
		synopsis = movieData.synopsis;
	} else if (movieData.synopsisShort != undefined){
		synopsis = movieData.synopsisShort;
	} else {
		synopsis = "";
	}
	document.getElementById('chosenMovieSynospis').innerHTML = giveUpTag(synopsis);
}

var autocomplete;


// Autocomplete the value when you click on the address
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
	
}

// Search in the array each time a letter is added in the search bar
function movieFinder(){
	document.getElementById("select-theater").innerHTML= "Sélectionnez un cinéma proche de chez vous";
	$(".movie-results").remove();
	if (elt_movie.value.length >= 2){
		recherche = traitementChaine(elt_movie.value);
		searchStringInArray(recherche,tab_filmsEnSalle);	
	}
}

// Search in the movie's array the title of the movie and add it to the movie list autocomplete
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
			document.getElementById('span-'+id_film).addEventListener('click', afficheFilm);
			fin++;
		}
	}
	return -1;
}

// Write the title of the movie into the search bar
function afficheFilm(film){
	
	if (film.toElement.innerHTML == ""){
		id = film.srcElement.id.split("affiche")[1];
		film = film.srcElement.alt;		
	} else {
		id = film.toElement.id.split("-")[1];
		film = film.toElement.innerHTML;
	}
	movie.value = giveUpTag(film);
	current_movie = id;
	console.log(current_movie);
	$(".movie-results").remove();
}


// Call the Allocine API to collect the number of pages it will returns
function recup_liste_films_en_salle(){
	var allocine_api = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&format=json&order=datedesc";
	$.getJSON(allocine_api, recup_liste);
}


// Call the Allocine API according to the number of pages
function recup_liste(recup_movie){
	// If there are results...
	if (recup_movie.feed.totalResults > 0) {
		
		// Round up the number of pages
		nb_pages = Math.ceil(recup_movie.feed.totalResults/10);
		lastRelease = recup_movie.feed.movie[0].release.releaseDate;
		
		// Call the Allocine API as long as there is page's result
		for(var j=1; j<= nb_pages; j++){	
			var allocine_api_page = "http://api.allocine.fr/rest/v3/movielist?partner="+key_allocine+"&filter=nowshowing&order=datedesc&format=json&page="+j;
			$.getJSON(allocine_api_page, recup_liste_films);
		}
	}
}


// Collect on each pages the movie's list and add it into the tab_filmsEnSalle array
function recup_liste_films(recup_film){

	// As long as there are movies to collect...
	for(k=0; k< recup_film.feed.movie.length; k++){	
		film_recent++;
		
		// We put them in the array, only if we can collect the array
		if ((recup_film.feed.movie[k].defaultMedia != undefined) && (recup_film.feed.movie[k].defaultMedia.media.title != undefined)) {
			film = splitNom(recup_film.feed.movie[k].defaultMedia.media.title);
			
			code_film = recup_film.feed.movie[k].code;
			tab_filmsEnSalle.push(code_film+";"+film);
			
			// If the movie's release is this week, we add the movie's id into the tab_thisWeeksRelease array to show 5 movies on the home page
			if ((!fin) && (recup_film.feed.movie[k].release.releaseDate ==  lastRelease)){

				tab_thisWeeksRelease.push(code_film+";"+film);
			} else if(tabIsOk){
				tabIsOk = false;
				showMeFiveMovies(tab_thisWeeksRelease);
				fin = true;
			}
			
		} else {
			// We put all the id of movies we couldn't collect the title into the tab_rates array in the purpose of verification
			tab_rates.push(recup_film.feed.movie[k].code);
		}
		
	}

}

// Random into the tab_thisWeeksRelease's array to show 5 movies on the home page
function showMeFiveMovies(array){
	var tab_alreadyThere = [];
	
	// We want to show 5 movies
	for (w=0; w<5; w++){
		// Return a random number to take a film into the array (while we haven't take it yet)
		do {
			id = random(array.length);

		} while (tab_alreadyThere.indexOf(id) != -1)
		tab_alreadyThere.push(id);
		
		var allocine_api_recherche = "http://api.allocine.fr/rest/v3/movie?partner="+key_allocine+"&code="+array[id].split(";")[0]+"&profile=large&format=json";
		(function(id, titre){ $.getJSON(allocine_api_recherche, function(d){ showMoviePicture(d, id, titre) }); })(array[id].split(";")[0], array[id].split(";")[1])
	}
}


// Put the 5 movies on the home page with the help of the template: template_moviesOfTheWeek
function showMoviePicture(recup_info, _id, _titre){

	info = recup_info.movie;
	
	// If the short's synopsis is not here, we collect the regular one
	if (info.synopsisShort == undefined){
		synopsis = info.synopsis;
	} else synopsis = info.synopsisShort;
	
	$("#movieOfTheWeek").append(template_moviesOfTheWeek(_id, _titre, giveUpTag(synopsis), rateClass(info.statistics.pressRating), rateClass(info.statistics.userRating), info.trailer.href, info.media[0].thumbnail.href));
	
	// Add the click on the poster
	(function(donnees){
		document.getElementById('affiche'+donnees).addEventListener('click', afficheFilm);
	})(_id)
}

