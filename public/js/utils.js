var tab_split = [" Bande-annonce"," - BANDE-ANNONCE", " Teaser", " TEASER", " - EXTRAIT", " - Extrait", " Extrait"];

// Hide sections beside the search bar
cleanScreen();
document.getElementById('section2').style.display="block";
document.getElementById('chatroom').style.display="none";

document.getElementById("mute").addEventListener("click", function(){ 
	if (document.getElementById("vid").muted == false){
		document.getElementById("sound").className = "icon-mute";	
	} else {
		document.getElementById("sound").className = "icon-sound";
	}
	document.getElementById("vid").muted = !document.getElementById("vid").muted;
});

document.getElementById('CGU').addEventListener('click', function(){ 
	cleanScreen();
	document.getElementById('section7').style.display="block";
}); 
document.getElementById('APropos').addEventListener('click', function(){ 
	cleanScreen();
	document.getElementById('section8').style.display="block";
});
document.getElementById('chercher').addEventListener('click', function(){ 
	cleanScreen();
	document.getElementById('section3').style.display="block";
}); 
document.getElementById('Contact').addEventListener('click', function(){ 
	cleanScreen();
	document.getElementById('section6').style.display="block";
});

// Remove accents and uppercase
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

// Return the rate rounded close to 0.5
function rateClass(rate){
	// console.log(rate);
	if (rate==undefined){
		return 0;
	} else {
		return (Math.round(rate * 2)*0.5)*10;
	}
	
}

// Return a random number between 0 and max (include)
function random(max){
	return Math.floor(Math.random() * (max));
}

// Remove tag to a text
function giveUpTag(texte){
	reg=new RegExp("<.[^>]*>", "gi" );
	return texte.replace(reg, "" );
}

// Return the title of a movie from his trailer's name
function splitNom(titre){
	var trouve = 0;
	for (n=0; n < tab_split.length && trouve == 0; n++){
		tab_decoupe_film = titre.split(tab_split[n]);
		if (tab_decoupe_film.length > 1) trouve = 1;
	}
	return tab_decoupe_film[0];
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

// Return the language version of the movie (VF or VOST)
function VOVF(code){
	// console.log(code);
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

function cleanScreen(){
	document.getElementById('section2').style.display="none";
	document.getElementById('section3').style.display="none";
	document.getElementById('section4').style.display="none";
	document.getElementById('section5').style.display="none";
	document.getElementById('section6').style.display="none";
	document.getElementById('section7').style.display="none";
	document.getElementById('section8').style.display="none";
}
