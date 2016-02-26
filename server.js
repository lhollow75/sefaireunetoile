var exp = require('express')(),
    express = require('express'),
    http = require('http');


module.exports = function(){
    
    
    return{
        _server : null,
        
        serverinit : function(){
            this._server = http.createServer(exp);
            this.route();
            this.listen();
        },
        
        route : function(){
            //Importing distant files, css, img, js
            //app.use('/static', exp.static('public'));
            exp.use('/static', express.static(__dirname + '/public'));
            
            // Routing to the Chat index.html file for testing purposes.
            exp.get('/', function (req, res) {
                res.sendfile(__dirname + '/index.html');
            });
        },
        
        listen : function(){
            this._server.listen(1337);
            console.log('Now listening');
        }
    }
};