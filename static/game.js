import {Player} from '../shared/entities.js'
import {Camera} from './camera.js'

let canvas = document.getElementById("canvas"); // canvas dom
let cbGhost = document.getElementById("cbGhost"); // checkbox ghosts_enabled
let cbCSP = document.getElementById("cbCSP"); // checkbox clientside prediction
let cbCSR = document.getElementById("cbCSR"); // checkbox server reconciliation
let cbEI = document.getElementById("cbEI"); // checkbox entity interpolation
let cbMap = document.getElementById("cbMAP"); // checkbox draw map
let chat = document.getElementById("chat");
// let chatWindow = document.getElementById('chatWindow');
let containerOptions = document.getElementById('containerOptions');
let container = document.getElementById('container');
let ctx = canvas.getContext('2d'); // canvas context (el renderizado se aplica en esto)

let responsive = false;
let canvasSizeScale = 3;

var url = new URL(window.location.href);
var scale = url.searchParams.get("scale");

if(scale){
  scale = parseInt(scale);
  if(scale > 0 && scale <= 4){
    canvasSizeScale = scale;
  } else {
    window.location.search = `?scale=${canvasSizeScale}`
  }
  console.log(scale);
}

document.getElementById(`r${canvasSizeScale}`).checked = true;


const baseWidth = 200;
const baseHeight = 150;

canvas.width = baseWidth * canvasSizeScale;
canvas.height = baseHeight * canvasSizeScale;
canvas.style.width = canvas.width;
canvas.style.height = canvas.height;
canvas.style.border = "2px solid orange"

containerOptions.style.width = canvas.width;
chat.style.width = canvas.width;
chat.style.height = 30;
chat.style.margin = "0 auto";
chat.style.border = "2px solid orange"

container.style.width = canvas.width;
container.style.height = parseInt(chat.style.height) + canvas.height;

function handleGameSizeChange(objeto){
  window.location.search = `?scale=${parseInt(objeto.value)+1}`
}

function setUpDocument(){

  if(responsive){
    window.addEventListener('resize', () => {
      console.log('resize');
      canvas.width = document.documentElement.clientWidth * 0.8;
      canvas.height = document.documentElement.clientHeight * 0.8;
      canvas.style.width = canvas.width;
      canvas.style.height = canvas.height;
      containerOptions.style.width = canvas.width;
      chat.style.width = canvas.width;
      container.style.width = canvas.width;
      container.style.height = parseInt(chat.style.height) + canvas.height;
      let width = Math.min(800, canvas.width);
      let height = Math.min(600, canvas.height);
      client.camera.updateViewport(width, height);
      canvas.imageSmoothingEnabled = false;
    });

  }

  for(let i=1; i<5; i++){
    let obj = document.getElementById(`r${i}`);
    obj.onclick = () => {handleGameSizeChange(obj);}
  }

  window.addEventListener('blur', () => {
    client.resetInputs();
  });

  chat.addEventListener("keydown", e => {
    if(e.keyCode == 13){
      let message = e.target.value;
      e.target.value = '';
      let arrayMessage = message.split(' ');
      if(arrayMessage[0] == "/name"){
        let nameCommand = {
          type: "name",
          message: arrayMessage[1]
        };
        client.socket.emit('command', nameCommand);
        return;
      }
      client.socket.emit('chat', message);
    }
  });

  document.getElementById('chat').addEventListener('focus', () => {
    client.resetInputs();
  });

  document.addEventListener('keydown', event => {
    if(event.target.nodeName.toLowerCase() === 'input' && event.target.type === 'text') return;
    switch(event.keyCode){
      case 65: // A
        client.inputs.left = true;
        break;
      case 87: // W
        client.inputs.up = true;
        break;
      case 68: // D
        client.inputs.right = true;
        break;
      case 83: // S
        client.inputs.down = true;
        break;
    };
  });

  document.addEventListener('keyup', event => {
    if(event.target.nodeName.toLowerCase() === 'input' && event.target.type === 'text') return;
    switch(event.keyCode){
      case 65: // A
        client.inputs.left = false;
        break;
      case 87: // W
        client.inputs.up = false;
        break;
      case 68: // D
        client.inputs.right = false;
        break;
      case 83: // S
        client.inputs.down = false;
        break;
    };
  });

  cbGhost.addEventListener('change', e => {
    if (e.target.checked) {
      client.ghosts_enabled = true;
      return;
    }
    client.ghosts_enabled = false;
  });

  cbMap.addEventListener('change', e => {
    if (e.target.checked) {
      client.draw_map_enabled = true;
      return;
    }
    client.draw_map_enabled = false;
  });

  cbCSP.addEventListener('change', e => {
    if (e.target.checked) {
      client.client_side_prediction = true;
      return;
    }
    client.client_side_prediction = false;
    cbCSR.checked = false;
    cbCSR.dispatchEvent(new Event('change'));
  });

  cbCSR.addEventListener('change', e => {
    if (e.target.checked && cbCSP.checked) {
      client.server_reconciliation = true;
      return;
    }
    cbCSR.checked = false;
    client.server_reconciliation = false;
  });

  cbEI.addEventListener('change', e => {
    if (e.target.checked) {
      client.entity_interpolation = true;
      return;
    }
    client.entity_interpolation = false;
  });

}

function Client(){
  this.socket = io();
  this.players = {};
  this.ghosts = {};
  this.input_sequence_number = 0;
  this.pending_inputs = [];
  this.pending_server_message = [];
  this.id = null;
  this.inputs = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  this.vWidth = Math.min(800, canvas.width);
  this.vHeight = Math.min(600, canvas.height);

  this.camera = new Camera(0,0,this.vWidth,this.vHeight,800,600);

  this.client_side_prediction = true;
  this.server_reconciliation = true;
  this.entity_interpolation = true;
  this.draw_map_enabled = true;
  this.ghosts_enabled = false;
  // this.mainLoop.bind(this);

}

Client.prototype.resetInputs = function(){
  this.inputs = {
    up: false,
    down: false,
    left: false,
    right: false
  };
}

Client.prototype.setUpSocket = function(){
  this.socket.on('auth', id => {
    // primer mensaje, recibe un id del sv
    this.id = id;
    console.log("Client ID: " + this.id);
  });

  this.socket.on('state', data => {
    // estado del mundo
    this.pending_server_message.push(data);
  });

  this.socket.on('chat', data => {
    console.log(data);
  });

}

Client.prototype.start = function(){
  this.setUpSocket();
  var frameTime = Date.now();
  this.lastFrameTime = frameTime;
  this.mainLoop(this.lastFrameTime);
}

Client.prototype.handleInput = function(delta){
  var input;
  let inputs = this.inputs;

  if(!inputs.left && !inputs.right && !inputs.down && !inputs.up) return;
  input = {inputs: {up: this.inputs.up, down: this.inputs.down, left: this.inputs.left, right:this.inputs.right}, delta: delta, "input_sequence_number": this.input_sequence_number++};
  this.socket.emit('input', input);

  if(this.client_side_prediction) this.players[this.id].applyInput(input);
  if(this.server_reconciliation) this.pending_inputs.push(input);

}

Client.prototype.drawMap = function(){
  let tileSize = 32
  let cameraTileX = Math.floor(this.camera.x/tileSize)*tileSize
  let cameraTileXWidth = Math.floor((this.camera.x+this.camera.vWidth)/tileSize)*tileSize
  let cameraTileY = Math.floor(this.camera.y/tileSize)*tileSize
  let cameraTileYHeight = Math.floor((this.camera.y+this.camera.vHeight)/tileSize)*tileSize
  let cont = 0
  let dibujando = 0
  let colorA = "rgba(255,255,255,0.6)"
  let colorB = "rgba(30,30,30,0.6)"

  for(let i = 0; i <= 800; i += tileSize){
    for(let j=0; j<600; j += tileSize){
      if(i >= cameraTileX - 1 * tileSize && i <= cameraTileXWidth + 1 * tileSize){
        if(j >= cameraTileY - 1 * tileSize && j <= cameraTileYHeight + 1 * tileSize){

          ctx.fillStyle = cont % 2 == 0 ? colorA : colorB;
          ctx.fillRect(i-this.camera.x, j-this.camera.y, tileSize, tileSize);
          dibujando += 1
        }

      }
      cont += 1
    }


  }

  console.log("cont: " + cont + " dibujando: " + dibujando);
}

Client.prototype.draw = function(){
  ctx.clearRect(0,0,canvas.width, canvas.height); // limpiar canvas

  if(this.draw_map_enabled)
    this.drawMap();

  let clientPlayer = this.players[this.id];
  if(clientPlayer){
    ctx.font = "12px Arial";
    let x = Math.round((clientPlayer.x + Number.EPSILON) * 100) / 100;
    let y = Math.round((clientPlayer.y + Number.EPSILON) * 100) / 100;
    ctx.fillStyle = "white";
    ctx.fillText("X: " + x + " Y: " + y, 5, 10);
  }


  if(this.ghosts_enabled)
    Object.keys(this.ghosts).forEach(id => { // dibujar cada ghost
      let ghost = this.ghosts[id];
      ghost.drawGhost(ctx, this.camera.x, this.camera.y);
    });

  Object.keys(this.players).forEach(id => { // dibujar cada player
    let player = this.players[id];
    player.draw(ctx, this.camera.x, this.camera.y, id == this.id);
  });

}

Client.prototype.processServer = function(){
  // TODO: clientside prediction, entity interp
  let data;

  let idsLocales = Object.keys(this.players); // array con las ids de players que estan en el cliente

  while(data = this.pending_server_message.shift()){
    // data = paquete [{player1}, {player2}], cada objeto contiene [id,x,y,last_input_number] de 1 cliente

    let idsServer = data.map(player => {
      return player.id;
    })

    for(var i=idsLocales.length-1;i>-1;i-=1){
      if(!idsServer.includes(idsLocales[i])){ // si un ID que esta como KEY en this.players NO se encuentra en el paquete del SERVER, el player no existe (se desconecto, o algo), por lo que hay que borrarlo en el cliente tambien
        delete this.players[idsLocales[i]];
      }
    }

    data.forEach(player => {
      // player es cada [id,x,y,last_input_number] (cada player)

      if(!this.players[player.id]){ // es un player nuevo, que no esta en este cliente, entonces instanciarlo como un obj player nuevo
        this.players[player.id] = new Player(player.x, player.y, {width: 800, height: 600}, player.name);
        if(player.id == this.id){
          this.camera.follow(this.players[player.id], this.vWidth/2, this.vHeight/2);
        }
      }

      let entity = this.players[player.id]; // la entidad en cuestion
      entity.name = player.name;

      let lastX = entity.x; // x antes de la reconciliacion
      let lastY = entity.y; // y antes de la reconciliacion


      let last_pending_input;

      let pending_inputs_before = [...this.pending_inputs];

      if(player.id == this.id){ // si la entidad es el cliente local (yo)

        entity.x = player.x; // el servidor establece la NUEVA x que llegó en el paquete actual
        entity.y = player.y; // el servidor establece la NUEVA y que llegó en el paquete actual

        var j = 0;

        if(this.ghosts_enabled){
          if(!this.ghosts[player.id]){
            this.ghosts[player.id] = new Player(player.x, player.y, {width: 800, height: 600});
          }
          this.ghosts[player.id].x = player.x;
          this.ghosts[player.id].y = player.y;
        } else {
          this.ghosts = {};
        }


        last_pending_input = this.pending_inputs[this.pending_inputs.length - 1];


        if(this.server_reconciliation){ // si hay server_reconciliation on
          while (j < this.pending_inputs.length) { // iterar cada pending_input (input guardado localmente antes de reconciliar)
            var input = this.pending_inputs[j]; // el input de esta iteración
            if (input.input_sequence_number <= player.last_processed_input) {  // revisar el input_sequence_number y compararlo con el ultimo input procesado por el sv, que llego en este mensaje xD!!
              this.pending_inputs.splice(j, 1); // descartar el input pendiente si el sv ya lo procesó (el cambio ya fue aplicado en el servidor)
            } else {
              entity.applyInput(input); // el servidor todavia no aplicó este input, entonces re-aplicarlo localmente para tener la posicion predicha del lado del cliente...
              j++;
            }
          }
        } else {
          this.pending_inputs = []; // no hay server_reconciliation ON, vaciar la lista de pending_inputs
        }


      } else {
        // no es el player del cliente, ver el flag de entity_interpolation y determinar k hacer xD
        if(this.entity_interpolation){
          entity.position_buffer.push([Date.now(), [player.x, player.y]]);
        } else {
          entity.x = player.x;
          entity.y = player.y;
        }
      }

      if(lastX != entity.x || lastY != entity.y){ // mostrar que hubo un fallo despues de la reconciliacion (la posicion del cliente local se modifico)
        // this.showReconciliationError(lastX, lastY, last_pending_input, pending_inputs_before, entity, player);
      }
    });
  }
}

Client.prototype.showReconciliationError = function(lastX, lastY, last_pending_input, pending_inputs_before, entity, player){
  console.log('player pos antes de reconciliation');
  console.log([lastX, lastY, this.input_sequence_number]);
  console.log("player pos despues de reconciliation: ");
  console.log([entity.x, entity.y, this.input_sequence_number]);
  console.log("paquete del server -> last processed input: " + player.last_processed_input);
  console.log("ultimo pending_input antes de reconciliation: ");
  console.log(last_pending_input);
  console.log("pending_inputs antes de reconciliation");
  console.log(pending_inputs_before);
}

Client.prototype.interpolateEntities = function(){
  // cortesia de gabriel gambetta !! (autor del article de lag compensation!!!)
  var now = Date.now(); // leve mod
  var render_timestamp = now - (1000.0 / 22); // el sv broadcastea cada 1000/22 ms (22 veces x segundo)

  for (var i in this.players) {
    var entity = this.players[i];

    // No point in interpolating this client's entity.
    if (entity.id == this.id) {
      continue;
    }

    // Find the two authoritative positions surrounding the rendering timestamp.
    var buffer = entity.position_buffer;

    // console.log(buffer);

    // Drop older positions.
    while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
      buffer.shift();
    }

    // Interpolate between the two surrounding authoritative positions.
    if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
      var x0 = buffer[0][1][0]; // leve modificacion
      var x1 = buffer[1][1][0]; // leve modificacion
      var y0 = buffer[0][1][1]; // leve mod
      var y1 = buffer[1][1][1]; // leve mod
      var t0 = buffer[0][0];
      var t1 = buffer[1][0];

      entity.x = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
      entity.y = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
    }
  }
}

Client.prototype.mainLoop = function(currentFrameTime){
  // verificar que el cliente recibio un id
  window.requestAnimationFrame(this.mainLoop.bind(this));
  if(!this.id) return;

  // framerate (delta) stuff
  let lastFrameTime = this.lastFrameTime;
  let delta = (currentFrameTime - lastFrameTime)/1000;
  this.lastFrameTime = currentFrameTime;

  // if(delta > 1/40){
  //   return;
  // }

  this.processServer();
  this.handleInput(delta);

  this.camera.update();

  if(this.entity_interpolation)
    this.interpolateEntities();

  this.draw();

  let player = this.players[this.id];
  if(!player) return;

}

const client = new Client();

setUpDocument();
client.start();
