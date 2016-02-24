var socket = io.connect('http://localhost:1337');
	// On connection to server, ask for user's name with an anonymous callback :
	socket.on('connect', function(){
		// Call the server-side function 'adduser' and send one parameter (value of prompt) :
		socket.emit('adduser', prompt("Quel est votre nom ?"));
	});
        
        
	// Listener, whenever the server emits 'updatechat', this updates the chat body :
	socket.on('updatechat', function (username, data) {
        $('#zone_chat').append('<p class="dialogue"><span class="contact_nickname">'+username + '</span><span class="arrow"></span><span class="contact_message">' + data + '</p>');
        var chat = document.getElementById('zone_chat');
        chat.scrollTop = chat.scrollHeight;
	});
        
        
	// When the server emits 'updaterooms', this updates the room the client is in :
	socket.on('updaterooms', function(rooms, current_room) {
        //We clean the rooms list.
		$('#rooms').empty();
        //Loop for each room element.
		$.each(rooms, function(key, value) {
            //We are reseting the HTML decoration for all rooms. TESTING PURPOSES.
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
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
			}
		});
	});