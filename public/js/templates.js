// Template of movie's showtime
var template_showtimes = function(id, showtime){
	var _tpl = [
		'<li id="showtime-'+id+'" class="showtime-btn"  onclick="javascript:show_hide();">',
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
		'<li id="filmEnSalle'+code+'-'+langue+'-'+format+'" class="en-salle">',
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

var template_moviesOfTheWeek = function(id, titre, synopsis, press, users, href, picture){
	var _tpl = [
		'<li>',
			'<div class="ca-content">',
				'<img id="affiche'+id+'" class="ca-affiche" src="'+picture+'" alt="'+titre+'">',
				'<h3 id="titre'+id+'" class="ca-title">'+titre+'</h3>',
				'<div class="ca-presse">Presse',
					'<span id="note-presse'+id+'" class="note-presse note-'+press+'"></span>',
				'</div>',
				'<div class="ca-spectateurs">Spectateurs',
					'<span id="note-spectateurs'+id+'" class="note-spectateurs note-'+users+'"></span>',
				'</div>',
				'<p id="synopsis'+id+'" class="synopsis">'+synopsis+'</p>',
			'</div>',
			'<a  href="'+href+'" id = "b-a'+id+'" class="html5lightbox btn-preview" data-group="mygroup"  data-thumbnail="" data-width="480" data-height="240" title="Vidéo">Voir la bande-annonce</a>',
		'</li>'
	]
	return _tpl.join('');
}
