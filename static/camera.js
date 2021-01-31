export function Camera(x, y, viewportWidth, viewportHeight, worldWidth, worldHeight){
  this.x = x || 0;
  this.y = y || 0;
  this.xDeadZone = 0;
  this.yDeadZone = 0;
  this.vWidth = viewportWidth;
  this.vHeight = viewportHeight;
  this.worldWidth = worldWidth;
  this.worldHeight = worldHeight;
  this.target = null;
}

Camera.prototype.follow = function(target, xDeadZone, yDeadZone){
  this.target = target;
  this.xDeadZone = xDeadZone;
  this.yDeadZone = yDeadZone;
}


Camera.prototype.updateViewport = function(viewportWidth, viewportHeight){
  this.vWidth = viewportWidth;
  this.vHeight = viewportHeight;
  this.follow(this.target, this.vWidth/2, this.vHeight/2);
}

Camera.prototype.update = function(){

  // console.log('camx: ' + this.x + " y: " + this.y + " Vwidth: " + this.vWidth + " worldwidth: " + this.worldWidth);
  if(!this.target) return; // si no tengo target, no update

  let targetX = this.target.x + this.target.width / 2;
  let targetY = this.target.y + this.target.height / 2;

  // followear player x con offsetX
  if(targetX - this.x + this.xDeadZone > this.vWidth){
    this.x = targetX - (this.vWidth - this.xDeadZone);
  } else if(targetX - this.xDeadZone < this.x){
    this.x = targetX - this.xDeadZone;
  }

  // followear player y con offsetY
  if(targetY - this.y + this.yDeadZone > this.vHeight){
    this.y = targetY - (this.vHeight - this.yDeadZone);
  } else if(targetY - this.yDeadZone < this.y){
    this.y = targetY - this.yDeadZone;
  }

  // colisiones del mapa con el mundo
  if(this.x < 0){
    this.x = 0;
  }
  if(this.x + this.vWidth >= this.worldWidth){
    this.x = this.worldWidth - this.vWidth;
  }
  if(this.y < 0){
    this.y = 0;
  }
  if(this.y + this.vHeight > this.worldHeight){
    this.y = this.worldHeight - this.vHeight;
  }

}
