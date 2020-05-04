--- load with 
--- sqlite3 database.db < schema.sql

DROP TABLE IF EXISTS appuser;
DROP TABLE IF EXISTS gamestats;

CREATE TABLE appuser (
	username VARCHAR(20) PRIMARY KEY,
	password TEXT
);

CREATE TABLE gamestats (
	username VARCHAR(50) PRIMARY KEY,
	numwins INTEGER,
	totalKills INTEGER,
	gamesplayed INTEGER,
	highestplace INTEGER,
	FOREIGN KEY(username) REFERENCES appuser(username)
);

INSERT INTO appuser VALUES('auser', 'apassword');