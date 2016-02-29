document.getElementById('chat-btn-close').addEventListener('click', function(){
	document.getElementById('chatroom').style.display='none';
});

var socket = io.connect('http://localhost:1337');
        
	// Listener, whenever the server emits 'updatechat', this updates the chat body :
	socket.on('updatechat', function (username, data) {
        $('#zone_chat').append('<p class="dialogue"><span class="contact_nickname">'+username + '</span><span class="arrow"></span><span class="contact_message">' + data + '</p>');
        var chat = document.getElementById('zone_chat');
        chat.scrollTop = chat.scrollHeight;
	});
        
        
    socket.on('updateconnected', function(usernumber){
        $('#chat-people').css('visibility','visible');
        $('#connected-number').empty();
        $('#connected-number').append(usernumber);
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




