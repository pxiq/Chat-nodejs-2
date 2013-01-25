
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var z = 0;
// ------ Socket.io events ---------
var io = socket.listen(server);
var users = {};
var messages = [];

io.sockets.on('connection', function (client){
  
  var current_user = {} ;

  for ( var user in users)
  {
      client.emit('new-user', users[user]);
  }

  for (var mess in messages)
  {
    console.log(mess);
    client.emit('messages', messages[mess]);
  }

  client.on('login', function (name){
    current_user.name = name;
    current_user.id = ++z;
    users[current_user.id] = current_user;
    io.sockets.emit('new-user', current_user);
  });

  client.on('messages', function (data) {
    var message = {};
    message.user = current_user.name;
    message.mess = data;
    messages.push(message);

    if (messages.length > 5) {
        messages.shift();
    };

    io.sockets.emit('messages', message);
  });

  client.on('disconnect', function(){
    if (!current_user) {
      return false
    };

    delete users[current_user.id];
    io.sockets.emit('disconnect', current_user);
  });
});

