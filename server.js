let path = require('path');
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let constants = require('./shared/constants');

// rutas
app.use('/static', express.static(__dirname + '/static'));
app.use('/shared', express.static(__dirname + '/shared'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// server http + express
server.listen(constants.PORT, () => {
  console.log(`Listening en ${constants.PORT}`);
});

// gameserver
var GameServer = require('./game_server');
let gameServer = new GameServer(io);
gameServer.start();
