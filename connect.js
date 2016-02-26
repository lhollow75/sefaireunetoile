var usernames = {},
    tab_room = [];
    rooms = [],
    roomsGenerated = 0,
    divroom = [];

module.exports = function(app){
    
    return {
        io : null,
        
        userconnect : function(app){
            this.io = require('socket.io')(app.server._server);
            this.events();
        },
        
        events : function(){
            this.io.on('connection', function (socket) {
                socket.on('adduser',function(username){
                    socket.username = username;
                    usernames[username] = username;
                   
                });
                socket.on('generaterooms',function(maxrooms){
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
                        socket.room = 'room'+roomnumber;
                        socket.join('room'+roomnumber);
                        tab_room.push(roomnumber);
                        console.log(tab_room);
                        var numberroom = 0;
                        for (var i = 0 ; i < tab_room.length ; i++){
                            if (tab_room[0] === tab_room[i]){
                                numberroom++;
                                var y = numberroom.toString();
                            }
                        }
                        socket.emit('usersinroom',y);
                        socket.emit('updatechat', 'Chat', 'Vous avez rejoint la room !');
                        socket.broadcast.to('room'+roomnumber).emit('updatechat', 'Chat', socket.username + ' a rejoint la conversation.');
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
                  //Quitting the current room :
		          socket.leave(socket.room);
	           });
            });
        }
    }
}