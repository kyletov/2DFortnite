function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }
class Stage{
  constructor(){

    this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
    this.bullets = [];
    this.walls = [];
    this.picks = [];
    this.player = null; // a special actor, the player

    this.border = new Border(this,-1000,-1000,2000,2000);
    // Add the player to the center of the stage
    var position = new Pair(0,0);

    var tempX=randint(this.border.width-250)-Math.floor((this.border.width-250)/2);
    var tempY=randint(this.border.height-250)-Math.floor((this.border.height-250)/2);

    // Add a random amount of walls in a 2000 by 2000 grid;
    for(var i = 0; i < randint(20)+5; i++){
      while(this.getActor(tempX,tempY)!=null){
        tempX=randint(this.border.width-250)-Math.floor((this.border.width-250)/2);
        tempY=randint(this.border.height-250)-Math.floor((this.border.height-250)/2);
      }
      position = new Pair (tempX,tempY);
      this.addWall(new Wall(this,position));
    }
  }

  createPlayer(){
    var position = new Pair(0,0);
    while(this.stage.getActor(tempX,tempY) != null){
      tempX = randint(this.stage.border.width-250)-Math.floor((this.stage.border.width-250)/2);
      tempY = randint(this.stage.border.height-250)-Math.floor((this.stage.border.height-250)/2);
    }
    position = new Pair(tempX,tempY);
    this.player = new Player(this,position);
    stage.addActor(this.player);
  }
  addActor(actor){
    this.actors.push(actor);
  }

  removeActor(actor){
    var index = this.actors.indexOf(actor);
    if(index != -1){
      this.actors.splice(index, 1);
    }
  }

  addBullet(bull){
    this.bullets.push(bull);
  }

  removeBullet(bull){
    var index = this.bullets.indexOf(bull);
    if(index != -1){
      this.bullets.splice(index, 1);
    }
  }

  addWall(w){
    this.walls.push(w);
  }

  removeWall(w){
    var index = this.walls.indexOf(w);
    if(index != -1){
      this.walls.splice(index, 1);
    }
  }
  addPickups(p){
    this.picks.push(p);

  }

  removePickups(p){
    var index = this.picks.indexOf(p);
    if(index != -1){
      this.picks.splice(index, 1);
    }
  }
  // Take one step in the animation of the game.  Do this by asking each of the actors to take a single step.
  // NOTE: Careful if an actor died, this may break!
  step(){

  	if (this.actors.length == 0){
      endGame();
    }


	for(var i = 0; i < this.actors.length; i++){
	  this.actors[i].step();
	}
	for(var i = 0; i < this.bullets.length; i++){
	  this.bullets[i].step();
	}
	for(var i = 0; i < this.walls.length; i++){
	  this.walls[i].step();
	}
	for(var i = 0; i < this.picks.length; i++){
	  this.picks[i].step();
	}
	this.border.step();

  }



  // return the first actor at coordinates (x,y) return null if there is no such actor
  getActor(x, y){
    for(var i = 0; i < this.actors.length; i++){
      if(this.actors[i].x==x && this.actors[i].y==y){
        return this.actors[i];
      }
    }
    return null;
  }

} // End Class Stage

class Person{
  constructor(stage,position){
    this.position = position;
    this.stage = stage;
    this.intPosition();
    this.velocity = new Pair(0, 0);
    this.active = true;
    this.life = 100;
    this.radius = 30;
    this.moveSpeed = 3;//how fast the character is going.
    this.kills=0;

  }

  step(){

    for(var i = 0; i < stage.walls.length; i++){
      if(this.isTouchingWall(stage.walls[i])){
        this.position.x-=this.velocity.x;
        this.position.y-=this.velocity.y;
      }
    }
    this.intPosition();
  }

  draw(image,context){
    context.save();
    context.translate(this.x-stage.offset.x,this.y-stage.offset.y);
    context.rotate(-this.facingAngle);
    context.drawImage(image,-Math.floor(image.width/2),-Math.floor(image.height/2));
    context.restore();

  }

  takeDmg(damage){//5 to 25 from bullets
    this.life-=damage;
    if (this.life <= 0){
      this.active = false;
    }

  }

  intPosition(){
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }
  fire(){
    var xComp = Math.cos(this.facingAngle);
    var yComp = -Math.sin(this.facingAngle);
    var newVel = new Pair(xComp,yComp);
    newVel.normalize();
    var tempPosition = new Pair(this.x+xComp*(this.radius+4),this.y+yComp*(this.radius+4));
    this.stage.addBullet(new Bullet(this.stage,tempPosition,newVel,this));
  }
  isTouchingWall(wall){
    var point = wall.nearestPointTo(this.position);
    var deltaX=this.x-point.x;
    var deltaY=this.y-point.y;
    var dist = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    return dist<this.radius;
  }
}

class Player extends Person{
  constructor(stage,position){
    super(stage,position);
    this.xDirection=0;//1 is up, -1 is down, 0 is still
    this.yDirection=0;//1 is right, -1 is left, 0 is still
    this.mX=0;
    this.mY=0;
    this.ammo = 30;


  }

  step(){
    this.velocity.x=this.xDirection*this.moveSpeed;
    this.velocity.y=this.yDirection*this.moveSpeed;
    if(this.position.x != this.position.x+this.velocity.x || this.position.y != this.position.y+this.velocity.y){
      console.log("Player moved!");
      send("Player moved!");
    }
    this.position.x+=this.velocity.x;
    this.position.y+=this.velocity.y;

    super.step();
  }

  look(mouseX,mouseY){
    this.mX=mouseX;
    this.mY=mouseY;
    var deltaX = mouseX-Math.floor(this.stage.width/2)-stage.boundary.left;
    var deltaY = mouseY-Math.floor(this.stage.height/2)-stage.boundary.top;
    this.facingAngle = Math.atan2(-deltaY,deltaX);
  }
  fire(){
    if(this.ammo>0){
      super.fire();
      this.ammo--;
    }
  }

  stop(movement){
    if(movement == "up"||movement == "down"){
      this.yDirection= 0;
    } else if(movement == "left"||movement == "right"){
      this.xDirection= 0;
    }
  }
  move(movement){

    if(movement == "up"){
      this.yDirection= -1;
    } else if(movement == "down"){
      this.yDirection= 1;
    } else if(movement == "left"){
      this.xDirection= -1;
    } else if(movement == "right"){
      this.xDirection= 1;
    }
  }

}

class Enemy extends Person{
  constructor(stage,position){
    super(stage,position);

    this.facingAngle = 0;
    this.moveCooldown = 0;
    this.shootCooldown = 0;

  }

  step(){
    var change = 0;
    if (this.moveCooldown > 60){
      change = randint(10);
      if(change > 8){
        this.facingAngle = randint(360)*Math.PI/180;
        this.moveCooldown = 0;
      }
    }
    this.moveCooldown += 1;

    if(this.shootCooldown > 45){
      change = randint(10);
      if(change > 6){
        this.fire();
        this.shootCooldown = 0;
      }
    }

    this.shootCooldown += 1;
    this.velocity.x = Math.cos(this.facingAngle)*this.moveSpeed;
    this.velocity.y = -Math.sin(this.facingAngle)*this.moveSpeed;
    this.position.x = this.position.x+this.velocity.x;
    this.position.y = this.position.y+this.velocity.y;
    super.step();

    if(!this.active){
      this.stage.removeActor(this);
      this.stage.numEnemies--;
      this.stage.addPickups(new Ammo(this.stage,this.position));
    }
  }
}

class Bullet{
  constructor(stage,position,velocity,person){
    this.stage = stage;
    this.position = position;
    this.velocity = velocity;
    this.person=person;
    this.intPosition();
    this.active = true;
    this.life = 30;
    this.moveSpeed = 20;
    this.radius = 4;
  }

  step(){
    var velocityX = this.velocity.x*this.moveSpeed;
    var velocityY = this.velocity.y*this.moveSpeed;
    this.position.x = this.position.x+velocityX;
    this.position.y = this.position.y+velocityY;

    this.intPosition();

    for(var i = 0; i < stage.actors.length; i++){
      if(this.isTouching(stage.actors[i])){
        stage.actors[i].takeDmg(randint(20)+5);
        if(!stage.actors[i].active){
          this.person.kills++;
        }
        this.active=false;
      }
    }
    this.life--;
    if(this.life <= 0){
      this.active = false;
    }

    if(!this.active){
      this.stage.removeBullet(this);
    }
  }

  draw(image,context){
    context.drawImage(image,this.x-stage.offset.x-Math.floor(image.width/2),this.y-stage.offset.y-Math.floor(image.height/2));
  }

  intPosition(){
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }
  isTouching(person){
    var deltaX = this.x-person.x;
    var deltaY = this.y-person.y;
    var dist = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    return (dist<(this.radius+person.radius));
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
class Wall{
  constructor(stage,position){
    this.stage=stage;
    this.life=250;
    this.position=position;
    this.active=true;
    this.intPosition();

  }
  step(){
    if(!this.active){
      stage.removeWall(this);
    }
  }
  draw(image,context){
    this.width = image.width;
    this.height = image.height;
    context.drawImage(image,this.x-stage.offset.x-Math.floor(image.width/2),this.y-stage.offset.y-Math.floor(image.height/2));
  }
  nearestPointTo(point){
    var nearest = new Pair(0,0);
    var left = this.x - Math.floor(this.width/2);
    var right = this.x + Math.floor(this.width/2);
    var top = this.y - Math.floor(this.height/2);
    var bottom = this.y + Math.floor(this.height/2);
    if(left>point.x){
      nearest.x = left;
    }else if (right<point.x){
      nearest.x = right;
    }else{
      nearest.x = this.x;
    }
    if(top>point.y){
      nearest.y = top;
    }else if (bottom<point.y){
      nearest.y=bottom;
    }else{
      nearest.y=this.y;
    }
    return nearest;
  }
  takeDmg(damage){ //25 to 75 from bullets
    this.life-=damage;
    if (this.life <= 0){
      this.active = false;
    }

  }

  intPosition(){
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }
}
class Ammo{
  constructor(stage,position){
    this.stage = stage;
    this.position = position;
    this.intPosition();
    this.active = true;
    this.life=300;
    this.radius = 15;
  }
  step(){

    var deltaX = this.x-this.stage.player.x;
    var deltaY = this.y-this.stage.player.y;
    var dist = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    if(dist<(this.radius+this.stage.player.radius)){
      this.active = false;
      stage.player.ammo += randint(15)+5;
    }
    this.life--;
    if(this.life<=0){
      this.active=false;
    }
    if(!this.active){
      stage.removePickups(this);
    }
  }
  draw(context){
    context.drawImage(image,this.x-stage.offset.x-Math.floor(image.width/2),this.y-stage.offset.y-Math.floor(image.height/2));
  }
  intPosition(){
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }
}

class Border{
  constructor(stage,top,left,width,height){
    this.stage = stage;
    this.top = top;
    this.left = left;
    this.width=width;
    this.height=height;

  }
  step(){
    for(var i = 0; i<stage.actors.length; i++){
      if(stage.actors[i].x<this.left||stage.actors[i].x>this.left+this.width){
        stage.actors[i].takeDmg(500);
      }
      if(stage.actors[i].y<this.top||stage.actors[i].y>this.top+this.height){
        stage.actors[i].takeDmg(500);
      }
    }
  }
  draw(context){
    context.fillStyle = "rgba(35,181,255,85)";
    context.fillRect(0, 0, stage.width ,stage.height);
    var left = 0;
    var top = 0;
    var width = stage.width;
    var height = stage.height;
    if(stage.offset.x<this.left){
      left = this.left-stage.offset.x;
    }
    if(stage.offset.y<this.top){
      top = this.top-stage.offset.y;
    }
    if(stage.offset.x+stage.width>this.left+this.width){
      width -= (stage.offset.x+stage.width)-(this.left+this.width);
    }
    if(stage.offset.y+stage.height>this.top+this.height){
      height-=(stage.offset.y+stage.height)-(this.top+this.height);
    }
    context.clearRect(left, top, width, height);
  }

}
module.exports = Stage;
