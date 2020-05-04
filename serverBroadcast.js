var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: 10751});


 const Stage = require('./node.js');

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(stage){
	for(let ws of this.clients){
		ws.send(JSON.stringify({'stage': stage}));
	}

	// Alternatively
	// this.clients.forEach(function (ws){ ws.send(message); });
}

wss.on('connection', function(ws) {
  stage.createPlayer();
	ws.send(JSON.stringify({'stage': stage}));
	ws.on('message', function(player) {
    stage.actors[0] = JSON.parse(player.data);;
    stage.step();
		wss.broadcast(stage);
	});
});
