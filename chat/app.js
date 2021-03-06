/*Chat Multiroom*/
/*
-WE ARE IN THE SERVER'S SIDE.-

For the client side, the following events are defined :
-connect
-updatechat
-updaterooms

ONE FUNCTION IS USED : 
-switchRoom
*/

// Declare variables, express is added to the app for routing. 
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

//Importing distant files, css, img, js
app.use('/static', express.static('public'));

// Routing to the Chat index.html file for testing purposes.
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

server.listen(1337);

// Usernames which are currently connected to the chat.
var usernames = {};

var x = 3;

// Rooms which are currently available in chat. (Will be the film shows list.)   
var rooms = [];

//Generating needed rooms
for(var i = 0 ; i < x ; i++){
    rooms.push('room'+i);
}

// When a socket is connected :
io.sockets.on('connection', function (socket) {
	// When the client emits 'adduser', this listens and executes : When a user is connected...
	socket.on('adduser', function(username){
		// Store the username in the socket session for this client.
		socket.username = username;
		// Store the room name in the socket session for this client.
		socket.room = 'room0';
		// Add the client's username to the global list.
		usernames[username] = username;
		// Send client to room 1 (WILL BE SELECTED ROOM (FILM SHOW SELECTED), PREVIOUSLY CHOSEN BY THE USER.)
		socket.join('room0');
		// Emit to client they've connected
		socket.emit('updatechat', 'Chat', 'Vous avez rejoint la room !');
		// Emit to room 1 that a person has connected to their room
		socket.broadcast.to('room0').emit('updatechat', 'Chat', username + ' a rejoint la conversation.');
        //Call for the 'updaterooms' event, send var rooms, event appearing in room 1 
		socket.emit('updaterooms', rooms, 'room0');
	});
	
	// When a user sends a message :
	socket.on('sendchat', function (data) {
        //If there is a message typed:
        if(data != ''){
		  // Calling 'updatechat', displaying the message with 2 parameters, username and date = message.
          io.sockets.in(socket.room).emit('updatechat', socket.username, data);
        }
	});
	
    //When a user switches from a room to another :
	socket.on('switchRoom', function(newroom){
        //We disconnect the user from the current room.
		socket.leave(socket.room);
        //We define a variable, 'newroom' which is the new room selected.
		socket.join(newroom);
        //We display a message for the user
		socket.emit('updatechat', 'SERVER', 'Vous avez changé de conversation.');
		// We send a message to the OLD room, broadcasted for all users.
		socket.broadcast.to(socket.room).emit('updatechat', 'Chat', socket.username+' a quitté cette conversation.');
		// Update socket session room title
		socket.room = newroom;
        //We broadcast for all users, a notification for a new user incoming.
		socket.broadcast.to(newroom).emit('updatechat', 'Chat', socket.username+' a rejoint la conversation.');
        //Call for the 'updaterooms' event, send var rooms, event appearing in the new selected room.
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// When the user disconnects :
	socket.on('disconnect', function(){
		// Remove the username from the usernames list :
		delete usernames[socket.username];
		// Update list of users in chat, client-side :
		io.sockets.emit('updateusers', usernames);
		// Broadcast that this client has left :
		socket.broadcast.emit('updatechat', 'Chat', socket.username + ' a quitté.');
        //Quitting the current room :
		socket.leave(socket.room);
	});
});

