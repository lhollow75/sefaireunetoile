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

var app = {};

app.server = require('./server')();
app.server.serverinit();

app.connection = require('./connect')();
app.connection.userconnect(app);