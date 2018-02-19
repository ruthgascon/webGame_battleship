$( document ).ready(function() {

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	var gamePlayerID = getParameterByName("gp");
	callAjax();

	function callAjax(){
		$.ajax({
			url: "http://localhost:8080/api/game_view/" + gamePlayerID,
			context: document.body
		}).done(function(data) {
			createTable (10, document.getElementById("userTable"), "userCell");
			createTable (10, document.getElementById("salvoTable"), "salvoesCell");
			getShips();
			getGamePlayersInfo();
			getSalvoes();
			hideloading();
			$('#backButton').on("click", goBack);

			function goBack () {
				window.location.replace("games.html");
			}

			function createTable (cells, table, cellsName){
				var numberOfCells = cells;
				var newLetter;
				for (var i = 0; i<numberOfCells+1; i++){
					if (i==0){
						var head = document.createElement ('thead')
						var row = document.createElement('tr');
						for (var x=0; x<numberOfCells+1; x++){
							var column = document.createElement('th');
							if (x!=0){
								column.append(x);
							}
							row.appendChild(column);
							head.appendChild(row);
							table.appendChild(head);
							//						$("#userTable thead").addClass("noBorder");
						}
					} else {
						if (i==1){
							var tbody = document.createElement ('tbody');
							newLetter = "A";
							table.appendChild(tbody);
						}
						var row = document.createElement('tr');
						tbody.appendChild(row);
						for (var x=0; x<numberOfCells; x++){
							if (x==0){
								var column1 = document.createElement('th');
								column1.append (newLetter);
								row.appendChild (column1);
							}
							var columns = document.createElement('td');
							var numberOfCell = x+1
							columns.setAttribute(cellsName, newLetter+numberOfCell);
							row.appendChild (columns);
						}
						nextLetter = String.fromCharCode(newLetter.charCodeAt(0)+1);
						newLetter = nextLetter;
					} 
				}
			}

			function getShips (){
				var shipsInfo = data.Ships;
				console.log ("dataShips", data.Ships);
				if (shipsInfo.length==0){
					$("#addShip").removeClass("hidden");
				}
				for (var y=0; y<shipsInfo.length; y++){
					var oneShipInfo = shipsInfo[y];
					//				console.log (oneShipInfo);
					var oneShipLocations = oneShipInfo.Locations;
					//				console.log (oneShipLocations);
					for (var x = 0; x<oneShipLocations.length; x++){

						var thisClass = "colored"+(oneShipInfo.Type.split(" ", 1));
						//					console.log ("thisClass",thisClass);
						var location = oneShipLocations[x];
						//					console.log ("location",location);
						$("[usercell="+location+"]").addClass(thisClass);
						$("[usercell="+location+"]").addClass("locatedShip");
					}
				}
			}

			function getGamePlayersInfo () {
				var gamePlayers = data["Game Players"];
				for (var x in gamePlayers){
					if(gamePlayers.length <2) {
						$("#User2").append("waiting your opponent...");
					};
					var userID = gamePlayers[x]["Game Player ID"];
					if (userID == gamePlayerID){
						var myMail = gamePlayers[x].Player.Email;
						$("#User1").append(myMail);
					} else {
						var opponentMail = gamePlayers[x].Player.Email;
						$("#User2").append("Your opponent mail: "+opponentMail);
					}
				}
			}

			function getSalvoes(){
				var Salvoes = data.Salvoes;
				for (var i in Salvoes){
					if (Salvoes[i].GamePlayer != gamePlayerID){
						printSalvos (Salvoes[i].Salvoes, "salvoesCell");
					} else {
						printSalvos (Salvoes[i].Salvoes, "userCell");
					}
				}
			}

			function printSalvos (whomSalvos, where) {
				var salvos = whomSalvos;
				//FUNCTION TO SORT THE SALVOS BY TURN
				function compare(a,b) {
					if (a.turnNumber < b.turnNumber)
						return -1;
					if (a.turnNumber > b.turnNumber)
						return 1;
					return 0;
				}
				salvos.sort(compare);
				//CHECK THE TURN AND PRINT THE SHIPS
				for (var y in salvos){
					var turn = salvos[y].Turn;
					var salvoLocArray = salvos[y].Locations;
					for (var x=0; x<salvoLocArray.length; x++){
						var salvoLoc = salvoLocArray[x];
						var newFigure = document.createElement("div");
						if (where=="userCell"){
							if ($("["+where+"="+salvoLoc+"]").hasClass("locatedShip")){

								$("["+where+"="+salvoLoc+"]").removeClass("salvoes");
								$("["+where+"="+salvoLoc+"]").addClass("hittedShip");
								var turnText = document.createElement ('p');
								turnText.append(turn);
								newFigure.append(turnText);
							} 
						}
						$("["+where+"="+salvoLoc+"]").append(newFigure);
						$("["+where+"="+salvoLoc+"]").addClass("salvoes");
					}
				}
			}

			function hideloading (){
				$('#content').removeClass("hidden");
				$('#loadingmessage').addClass("hidden");
			};
		});
	}
	
	$('#addShip').on("click", function(){
		var listOfShips = [{ "type": "Destroyer", "locations": ["A1", "B1", "C1"]},
											 { "type": "Patrol boat", "locations": ["H5", "H6"] }];
		sendShips(listOfShips);
	});

	function sendShips (ships){
		$.ajax({
			data: JSON.stringify(ships),
			contentType: "application/json",
			timeout: 1000,
			type: 'POST',
			url: '/api/games/players/'+gamePlayerID+'/ships'
			//			statusCode: {
			//				403: function() {
			//					console.log ("DO SOMETHING");
			//				}
			//			}
		}).done(function(data, textStatus, jqXHR){
			location.reload();
		})
	}



});