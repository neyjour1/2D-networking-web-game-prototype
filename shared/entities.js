import "./constants.js"

export class Player{
  constructor(x=40,y=40,world=null,name=undefined){
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 250;
    this.world = world;
    this.position_buffer = [];
    this.name = name;
  }

  applyInput(input){
    // console.log(input);
    var dt = input.delta;
    var inputs = input.inputs;
    if(inputs.left){
      this.x -= this.speed * dt;
    }
    if(inputs.right){
      this.x += this.speed * dt;
    }
    if(inputs.up){
      this.y -= this.speed * dt;
    }
    if(inputs.down){
      this.y += this.speed * dt;
    }

    if(!this.world) return;

    if(this.x <= 0) this.x = 0;
    if(this.x + this.width >= this.world.width) this.x = this.world.width -  this.width;
    if(this.y + this.height >= this.world.height) this.y = this.world.height -  this.height;
    if(this.y <= 0) this.y = 0;

  }

  drawGhost(context, xCam, yCam){
    let ctx = context;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(this.x-xCam, this.y-yCam, this.width, this.height);
  }

  draw(context, xCam, yCam, client=false){
    let ctx = context;
    ctx.fillStyle = !client ? "red" : "blue";
    ctx.fillRect(this.x-xCam, this.y-yCam, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    let width = ctx.measureText(this.name).width;
    ctx.fillText(this.name, this.x -xCam + this.width/2 - width/2, this.y - yCam -5);
  }

}
