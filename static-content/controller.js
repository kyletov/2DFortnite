stage = null;
view = null;
interval = null;
gameStatus = false;
socket;

function send(message){
  socket.send(message);
}
function goOnline(){
  socket = new WebSocket("ws://142.1.200.140:11021");
  socket.onopen = function (event) {
    console.log("connected");
    this.stage= new Stage(JSON.parse(event.data));
    setupGame();
    socket.send(JSON.stringify({'player':stage.player}));
  };
  socket.onclose = function (event) {
    alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
    pauseGame();
  };
  socket.onmessage = function (event) {
    this.stage.stage=JSON.parse(event.data);

  };
}
function setupGame(){
  gameStatus = true;

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
  document.addEventListener('keyup', stopMove);
	document.addEventListener('mousemove',aim);
	document.addEventListener('mousedown',shoot);

}

function startGame(){
  stage.canvas = document.getElementById('stage');
	interval = setInterval(function(){ socket.send(JSON.stringify({'player':stage.player}));stage.draw();}, 33.5);
}

function pauseGame(){
	clearInterval(interval);
	interval = null;
}
function endGame(){
  pauseGame();
  gameStatus = false;

  var place = stage.numEnemies + 1;
  var isWon = (stage.numEnemies == 0) ? 1 : 0;
  var numKills = stage.player.kills;

  updateStats(place, isWon, numKills);
}

function gameRunning(){
  return gameStatus;
}

function moveByKey(event){
	var key = event.key;
	var moveMap = {
		'a': { "move": "left"},
		's': { "move": "down"},
		'd': { "move": "right"},
		'w': { "move": "up"}
	};

	if(key in moveMap && gameStatus){
		stage.player.move(moveMap[key].move);
	}

}
function stopMove(event){
  var key = event.key;
  var moveMap = {
    'a': { "move": "left"},
    's': { "move": "down"},
    'd': { "move": "right"},
    'w': { "move": "up"}
  };
  if(key in moveMap && gameStatus){
		stage.player.stop(moveMap[key].move);
	}
}
function aim(event){

  var x = event.clientX;
  var y = event.clientY;
  if(gameStatus){
    stage.player.look(x,y);
  }

}

function shoot(event){
  if(gameStatus){
  	switch(event.which){
  		case 1:
  		      stage.player.fire();

  			break;
  	}
  }
}
