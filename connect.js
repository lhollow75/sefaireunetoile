//Declaring variables
var usernames = {},
    tab_room = [];
    rooms = [],
    roomsGenerated = 0,
    divroom = [];

//Exporting module
module.exports = function(app){
    //All functions in the io object.
    return {
        io : null,
        
        //Importing socket.io from the server.js module
        userconnect : function(app){
            this.io = require('socket.io')(app.server._server);
            this.events();
        },
        
        //All events from the chat.
        events : function(){
            this.io.on('connection', function (socket) {
                socket.on('adduser',function(username){
                    //Storing the username in a socket variable
                    socket.username = username;
                    usernames[username] = username;
                });
                socket.on('generaterooms',function(maxrooms){
                    //If this is a first connection, getting all rooms ids, and getting the user ready, if there is a room switch.
                    socket.roomGeneration = roomsGenerated;
                    if (socket.roomGeneration === 0){
                        for (var i = 0 ; i < maxrooms ; i++){
                            var x = i.toString();
                            rooms.push("room"+x);
                            roomsGenerated = 1;
                            socket.roomGeneration = roomsGenerated;
                        }
                    } else {
                        rooms = [];
                        for (var i = 0 ; i < maxrooms ; i++){
                            var x = i.toString();
                            rooms.push("room"+x);
                        }
                    }   
                });
                socket.on('roomchoice',function(roomnumber){
                        //When a user chooses a room :
                        socket.room = 'room'+roomnumber;
                        //Storing and joining the room
                        socket.join('room'+roomnumber);
                        /*Couting users in room*/
                        var clients = socket.adapter.rooms[socket.room];
                        var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
                        socket.in(socket.room).emit('updateconnected', numClients);
                        socket.emit('updateconnected', numClients);
                        /*Couting users in room*/
                        //Emitting message, once the user is connected.
                        socket.emit('updatechat', 'Chat', 'Vous avez rejoint la room !');
                        socket.broadcast.emit('updatechat', 'Chat', socket.username + ' a rejoint la conversation.');
                        socket.emit('updaterooms', rooms, 'room'+roomnumber);
                });
                socket.on('sendchat', function (data) {
                    //If there is a message typed:
                    if(data != ''){
		              // Calling 'updatechat', displaying the message with 2 parameters, username and date = message.
                      socket.in(socket.room).emit('updatechat', socket.username, data);
                      socket.emit('updatechat', socket.username, data);
                    }
	            });
                socket.on('switchRoom', function(newroom){
                    /*Couting users in room*/
                    var clients = socket.adapter.rooms[socket.room];
                    var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
                    socket.in(socket.room).emit('updateconnected', numClients);
                    socket.emit('updateconnected', numClients);
                    /*Couting users in room*/
                    //We disconnect the user from the current room.
		            socket.leave(socket.room);
                    //We define a variable, 'newroom' which is the new room selected.
		            socket.join('room'+newroom);
                    //We display a message for the user
		            socket.emit('updatechat', 'SERVER', 'Vous avez changé de conversation.');
		            // We send a message to the OLD room, broadcasted for all users.
		            socket.broadcast.to(socket.room).emit('updatechat', 'Chat', socket.username+' a quitté cette séance.');
		            // Update socket session room title
		            socket.room = 'room'+newroom;
                    //We broadcast for all users, a notification for a new user incoming.
		            socket.broadcast.to(socket.room).emit('updatechat', 'Chat', socket.username+' a rejoint la conversation.');
	           });
               socket.on('disconnect', function(){
		          // Remove the username from the usernames list :
		          delete usernames[socket.username];
		          // Update list of users in chat, client-side :
		          socket.emit('updateusers', usernames); 
		          // Broadcast that this client has left :
		          socket.broadcast.to(socket.room).emit('updatechat', 'Chat', socket.username + ' a quitté le chat.');
                  /*Couting users in room*/
                  var clients = socket.adapter.rooms[socket.room];
                  var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
                  socket.broadcast.emit('updateconnected', numClients);
                  /*Couting users in room*/
                  //Quitting the current room :
		          socket.leave(socket.room);
	           });
            });
        }
    }
}