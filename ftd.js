// Exercise: Complete this so that it is a truly restful api
// 1) Make sure all routes return appropriate http error status
// 2) Complete so that delete works, add this to the front end as well
// 3) Complete so that retrieve works better on the front end
// 3) Add users and login. For a truly restful api, no sessions are allowed
//    this means that you will have to send some kind of authentication
//    token on each request requiring authentication. One example is
//    user and password on each appropriate request. Another example
//    is user and hash(user+password+request_payload), the server can verify
//    that the user is the only one that could have generated the request.

var port = process.argv[2];
var express = require('express');
var app = express();

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
const sqlite3 = require('sqlite3').verbose();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// will create the db if it does not exist
var db = new sqlite3.Database('db/database.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the database.');
});

// https://expressjs.com/en/starter/static-files.html
app.use(express.static('static-content'));

// check login
app.post('/ftd/api/login/:username/:password', function (req, res) {
	var username = req.params.username;
	var password = req.params.password;

	// http://www.sqlitetutorial.net/sqlite-nodejs/query/
	let sql = 'SELECT * FROM appuser WHERE username=? AND password=?;';
	db.get(sql, [username, password], (err, row) => {
		var result = {};
  		if (err) {
  			res.status(409);
    		result["error"] = err.message;
  		} else {
  			if (row) {
  				res.status(200);
  				result["msg"] = "Login successful!";
  			} else {
  				res.status(200);
  				result["msg"] = "Incorrect username or password.";
  			}
		}
		res.json(result);
	});
});

// create a new user (idempotent)
app.post('/ftd/api/register/:username/:password', function (req, res) {
	var username = req.params.username;
	var password = req.params.password;
	console.log("POST:"+username);

	let sql = 'INSERT INTO appuser(username, password) VALUES(?,?);';
	db.run(sql, [username, password], function (err){
		var result = {};
  		if (err) {
			res.status(409);
    		result["error"] = err.message;
  		} else {
			result["msg"] = "Register successful!";
		}
		res.json(result);
	});
});

// retrieve all users (idempotent)
app.get('/ftd/api/users/', function (req, res) {
	// http://www.sqlitetutorial.net/sqlite-nodejs/query/
	let sql = 'SELECT * FROM appuser;';
	db.all(sql, [], (err, rows) => {
		var result = {};
		result["users"] = [];
  		if (err) {
  			res.status(409);
    		result["error"] = err.message;
  		} else {
			rows.forEach((row) => {
			result["users"].push(row["username"]);
			});
		}
		res.json(result);
	});
});

// retrieve gamestats of all users (idempotent)
app.get('/ftd/api/gamestats/', function (req, res) {
	// http://www.sqlitetutorial.net/sqlite-nodejs/query/
	let sql = 'SELECT * FROM gamestats ORDER BY numwins DESC, gamesplayed ASC, highestplace ASC;';
	db.all(sql, [], (err, rows) => {
		var result = {};
		result["stats"] = [];
  		if (err) {
  			res.status(409);
    		result["error"] = err.message;
  		} else {
			rows.forEach((row) => {
			result["stats"].push(row);
			});
		}
		res.json(result);
	});
});

// retrieve gamestats of specific user (idempotent)
app.get('/ftd/api/:username/', function (req, res) {
	var username = req.params.username;

	// http://www.sqlitetutorial.net/sqlite-nodejs/query/
	let sql = 'SELECT * FROM gamestats WHERE username=?';
	db.get(sql, [username], (err, row) => {
		var result = {};
  		if (err) {
			res.status(409);
    		result["error"] = err.message;
  		} else if (row) {
			result[username] = row;
		} else {
			result["msg"] = "" + username + " doesn't exists or didn't play any games yet.";
		}
		res.json(result);
	});
});

// update game stats (not idempotent)
app.post('/ftd/api/gamestats/insert/:username/', function (req, res) {
	var username = req.params.username;
	var place = req.body.place;
	var isWon = req.body.isWon;
	var score = req.body.score;
	console.log("POST:"+ username + ": place: " + place + " isWon: " + isWon + " score: " + score);

	let sql = 'SELECT * FROM gamestats WHERE username=?;';
	db.get(sql, [username], (err, row) => {
		var result = {};
  		if (err) {
  			res.status(409);
    		result["error"] = err.message;
    		res.json(result);
  		} else {
  			if (row) { // game stats for user already exists
  				if (place >= row['highestplace']){
  					place = row['highestplace'];
  				}
  				// http://www.sqlitetutorial.net/sqlite-nodejs/update/
				let sql = 'UPDATE gamestats SET numwins=numwins+?, totalKills=totalKills+?, gamesplayed=gamesplayed+1, highestplace=? WHERE username=?;';
				db.run(sql, [isWon, score, place, username], function (err){
			  		if (err) {
						res.status(404);
			    		result["error"] = err.message;
			    		res.json(result);
			  		} else {
						if(this.changes!=1){
							res.status(404);
			    			result["error"] = "Not updated";
							res.json(result);
						} else {
							result["msg"] = "Game stats are updated successfully!";
							res.json(result);
						}
					}
				});
  			} else { // game stats for user doesn't exist
  				// http://www.sqlitetutorial.net/sqlite-nodejs/update/
				let sql = 'INSERT INTO gamestats VALUES(?, ?, ?, 1, ?);';
				db.run(sql, [username, isWon, score, place], function (err){
			  		if (err) {
			  			res.status(409);
    					result["error"] = err.message;
    					res.json(result);
			  		} else {
			  			result["msg"] = "Game stats are saved successfully!";
			  			res.json(result);
			  		}
				});
			}
  		}
	});
});

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

// db.close();
