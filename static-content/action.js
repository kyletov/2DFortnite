function updateStats(place, isWon, numKills){
	var username = $("td[name='player_name']").text();

	$.ajax({ 
		method: "POST", 
		url: "/ftd/api/gamestats/insert/"+username,
		data: { "place": place, "isWon": isWon, score: numKills }
	}).done(function(data){
		alert(data.msg);
	}).fail(function(data){
		console.log("failed to update game stats.");
	});

}

function viewgamestats(){

	$.ajax({ 
		method: "GET", 
		url: "/ftd/api/gamestats/"
	}).done(function(data){
		
		if (data.error) {
			$("#error").html(data.error);
		} else {
			$("#error").html("");
		}

		if (data.stats){

			// Generate table header row of gamestats
			var table_headers = '<tr><th>Username</th><th>Number of Wins</th><th>Total Kills</th><th>Games Played</th><th>Highest Place</th></tr>';
			$("table#gamestats").html(table_headers);

			// Fill out gamestats table with data
			for(i = 0; i < data.stats.length; i++){
				$("table#gamestats").append(
					'<tr><td>'+data.stats[i].username+'</td>'
					+'<td>'+data.stats[i].numwins+'</td>'
					+'<td>'+data.stats[i].totalKills+'</td>'
					+'<td>'+data.stats[i].gamesplayed+'</td>'
					+'<td>'+data.stats[i].highestplace+'</td></tr>');
			}
		}

	});
}

