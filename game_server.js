const constants = require('./shared/constants');

import {Player} from './shared/entities'

let canvas = {
  width: 800,
  height: 600
}

function GameServer(socketIo) {
  this.io = socketIo; // socket io instancia
  this.players = {}; // objeto que almacena players usando como key=socketid
  this.lastProcessedInput = {}; // almacenar lastprocessedinput para cada player
  this.serverMessages = [];
  this.setUpConnections();
};

GameServer.prototype.start = function(){
  this.broadcastInterval = setInterval(this.broadcast.bind(this), constants.SERVER_TICK_RATE); // broadcast 22 fps
  this.gameLoopInterval = setInterval(this.gameLoop.bind(this), constants.WORLD_TICK_RATE); // update 66 fps
}

GameServer.prototype.setUpConnections = function(){
  this.io.on('connection', socket => {
    var id = socket.id;

    // asignar un ID -> cliente
    socket.emit('auth', id)

    this.players[id] = new Player(30,30,canvas);
    this.lastProcessedInput[id] = 0;

    socket.on('input', data => {
      data.id = id;
      this.serverMessages.push(data);
    });

    socket.on('disconnect', () => {
      delete this.players[id];
      delete this.lastProcessedInput[id];
    });

    socket.on('chat', data => {
      this.io.emit('chat', this.players[id].name + ": " + data);
    });

    socket.on('command', data => {
      if(data.type == "name"){
        console.log("name recibido!");
        this.players[id].name = data.message;
      }
    })

  });
}

GameServer.prototype.gameLoop = function(){
  // get dt
  let now = Date.now();
  let last = this.lastFrameTime || now;
  var delta = (now - last)/1000;
  this.lastFrameTime = now;

  // update mundo (estado de las entidades -> posicion)
  this.updateWorld();

}

GameServer.prototype.getState = function(){
  let state = Object.keys(this.players).map(id => {
    let player = this.players[id];
    return {id: id, x: player.x, y: player.y, last_processed_input: this.lastProcessedInput[id], name: player.name};
  })
  return state;
}

GameServer.prototype.broadcast = function(){
  let state = this.getState();
  this.io.emit('state', state);
}

GameServer.prototype.updateWorld = function(){
  // aca llegan los mensajes pendientes en la queue serverMessages
  let message;
  while(message = this.serverMessages.shift()){
    let player = this.players[message.id] || undefined;
    if(!player) return;
    player.applyInput(message); // aplicar al player el input recibido en el mensaje
    this.lastProcessedInput[message.id] = message.input_sequence_number; // actualizar last_input_number del player
  }
}

module.exports = GameServer;
