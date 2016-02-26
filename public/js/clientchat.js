/*var listeSeances = document.getElementsByClassName('horaires-liste')[0],
    seances = listeSeances.getElementsByTagName('li'),
    numrooms = seances.length;
for (var i = 0; i < seances.length ; i++){
    var x = i,
    y = x.toString();
    seances[i].setAttribute('class',y);
    seances[i].addEventListener('click',function(){
        //numrooms = numrooms.toString();
        //AJOUTER CONDITION IF
        socket.emit('generaterooms',numrooms);
        // Call the server-side function 'adduser' and send one parameter (value of prompt) :
        socket.emit('adduser', prompt("Quel est votre nom ?"));
        var myClass = $(this).attr("class");
        myClass = myClass.toString();
        socket.emit('roomchoice',myClass);
    });
}; */ 


document.getElementById('chat-btn-close').addEventListener('click', function(){
	document.getElementById('chatroom').style.display='none';
});

var socket = io.connect('http://localhost:1337');
    // On connection to server, ask for user's name with an anonymous callback :
    /*socket.on('connect', function(){
		  // Call the server-side function 'adduser' and send one parameter (value of prompt) :
		  socket.emit('adduser', prompt("Quel est votre nom ?"));
    }); */
    socket.on('usersinroom', function(users){
        if(users > 1) {
            document.getElementById('connected-number').innerHTML = users;
            document.getElementById('chat-people').style.visibility = "visible";
        }
            
    });
        
	// Listener, whenever the server emits 'updatechat', this updates the chat body :
	socket.on('updatechat', function (username, data) {
        $('#zone_chat').append('<p class="dialogue"><span class="contact_nickname">'+username + '</span><span class="arrow"></span><span class="contact_message">' + data + '</p>');
        var chat = document.getElementById('zone_chat');
        chat.scrollTop = chat.scrollHeight;
	});
        
        
       
        
        
    //Calling the server's side function switchRoom, with room as a parameter.
	function switchRoom(room){
		socket.emit('switchRoom', room);
	}
	
	// On load of page
	$(function(){
		// When the user, clicks the send button :
		$('#envoi_message').click( function() {
			var message = $('#message').val();
			$('#message').val('');
			// Tell the server to execute 'sendchat' and send along one parameter, the message :
			socket.emit('sendchat', message);
		});
		// When the client hits ENTER on their keyboard, same as above, with a simulated click :
		$('#message').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#envoi_message').focus().click();
                $(this).focus();
			}
		});
	});


//Show_Hide
function show_hide()
{
    if(document.getElementById('chatroom').style.visibility=="hidden")
    {
        document.getElementById('chatroom').style.visibility="visible";
    }
    else
    {
        document.getElementById('chatroom').style.visibility="hidden";
    }
    return true;
}






