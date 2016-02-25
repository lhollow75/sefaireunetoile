// Template of movie's showtime
var template_showtimes = function(id, showtime){
	var _tpl = [
		'<li id="showtime-'+id+'" class="showtime-btn">',
		   '<button id="movie-schedule-'+id+'" class="horaires-btn">'+showtime+'</button>',

			'<!--<div class="circle">',
				'<span data-notification="0" class="notifications"></span>',
			'</div>-->',
		'</li>'
	]
	return _tpl.join('');
}

// Template of movie's on show in a theater
var template_filmEnSalle = function(code, title, source, langue, format){
	var _tpl = [
		'<li id="filmEnSalle'+code+'" class="en-salle">',
				'<img id = "afficheEnSalle'+code+'" class="da-affiche" src="'+source+'" alt="'+title+'">',
				'<h3 class="da-title">'+title+'</h3>',
				'<h4 class="da-langue">'+langue+'</h4>',
				'<h4 class="da-format">'+format+'</h4>',
		'</li>'
	]
	
	
	return _tpl.join('');
}

// Template of movie's list
var template = function(list, id){
	var _tpl = [
		'<li class="movie-results">',
			'<span id="'+id+'">'+list+'</span>',
		'</li>'
	]
	return _tpl.join('');
}