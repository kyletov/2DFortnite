function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
  constructor(stage){
    this.stage = stage;
    this.canvas = null;
    this.player = stage.player; // a special actor, the player

    this.crosshair = new Image();
    this.crosshair.src = "icons/crosshair.png";
    this.offset = new Pair(0,0);

    this.offset.x = this.player.x - Math.floor(this.stage.width/2);
  	this.offset.y = this.player.y - Math.floor(this.stage.height/2);
  }
  draw(){
    this.offset.x = this.player.x - Math.floor(this.stage.width/2);
  	this.offset.y = this.player.y - Math.floor(this.stage.height/2);
    var context = this.canvas.getContext('2d');
    this.stage.border.draw(context);
    var image = new Image();
    this.image.src = "icons/Player_1.png";
    for(var i = 0; i < this.stage.actors.length; i++){
      this.stage.actors[i].draw(image,context);
    }
    this.image.src="icons/Bullet_1.png";
    for(var i = 0; i < this.stage.bullets.length; i++){
      this.stage.bullets[i].draw(image,context);
    }
    this.image.src="icons/BlueBox.png";
    for(var i = 0; i < this.stage.walls.length; i++){
      this.stage.walls[i].draw(image,context);
    }
    this.image.src="icons/ammo.png";
    for(var i = 0; i < this.stage.picks.length; i++){
      this.stage.picks[i].draw(image,context);
    }
    context.drawImage(this.crosshair,this.player.mX-Math.floor(this.crosshair.width/2)-this.stage.boundary.left,this.player.mY-Math.floor(this.crosshair.height/2)-this.stage.boundary.top);
    context.font="18px Comic Sans MS";
    context.fillStyle = "blue";

    context.fillText("HP: " + this.player.life, 10, 20);
    context.fillText("Kills: " + this.player.kills, 10, 40);
    context.fillText("Ammo " + this.player.ammo, 10, 60);


  }
}
class Pair {
  constructor(x,y){
    this.x = x;
    this.y = y;

  }

  toString(){
    return "("+this.x+","+this.y+")";
  }

  normalize(){
    var magnitude = Math.sqrt(this.x*this.x+this.y*this.y);
    this.x = this.x/magnitude;
    this.y = this.y/magnitude;
  }
}
