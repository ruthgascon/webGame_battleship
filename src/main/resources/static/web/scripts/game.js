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
							if (cellsName == "userCell"){
								columns.setAttribute("ondrop", "drop(event)");
								columns.setAttribute("ondragover", "allowDrop(event)");
							}						
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
					$("#addShips").removeClass("hidden");
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

	$('#addShips').on("click", function(){
		$('#sendShips').removeClass("hidden");
	});

	$('#sendShips').on("click", function(){
		var listOfShips = 
				[
					{ "type": "Destroyer", "locations": ["A1", "B1", "C1"]},
					{ "type": "Patrol boat", "locations": ["H5", "H6"] }
				];
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

///DRAG AND DROP

var dataOfTheShip;
var itIsInsideTheGrid;
var position;

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
	dataOfTheShip = ev.currentTarget;
	if (dataOfTheShip.tagName == "DIV"){
		itIsInsideTheGrid = false;
	} else {
		itIsInsideTheGrid = true;
	}
	position = ev.target.getAttribute("data-position");
	var imageWidth = 45;
	var xPosition = (Number(position) * imageWidth) + (imageWidth/2);
	var xPosition = position * imageWidth + (imageWidth/2);
	var dataName = ev.target.parentNode.getAttribute ("data-name");
	setTheGhost (dataName, imageWidth, xPosition);
	function setTheGhost (dataName, imageWidth, xPosition){
		var ghost = document.getElementById(dataName);
		ev.dataTransfer.setDragImage(ghost, xPosition, imageWidth/2);
		//		if (itIsInsideTheGrid){
		//			ev.dataTransfer.setDragImage(ghost, xPosition, imageWidth/2);
		//		} else {
		//			ev.dataTransfer.setDragImage(ghost, xPosition, imageWidth/2);
		//		}
	}

}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var cellInfo = ev.target;
	calculatingCells (cellInfo);
}

function calculatingCells(cellInfo){
	var kindOfShip = dataOfTheShip.getAttribute("data-name");
	var cellNumber = cellInfo.getAttribute("userCell");
	if (kindOfShip == "Destroyer"){
		printShip (3, cellNumber, "coloredDestroyer", kindOfShip, dataOfTheShip);
	} else if(kindOfShip == "Submarine"){
		printShip(3, cellNumber, "coloredSubmarine", kindOfShip, dataOfTheShip);
	} else if (kindOfShip == "Carrier"){
		printShip(5, cellNumber, "coloredCarrier", kindOfShip, dataOfTheShip);
	} else if (kindOfShip == "BattleShip"){
		printShip(4, cellNumber, "coloredBattleship", kindOfShip, dataOfTheShip);
	} else if (kindOfShip == "PatrolBoat"){
		printShip(2, cellNumber, "coloredPatrol", kindOfShip, dataOfTheShip);
	}
}

function printShip(longOfShip, cellNumber, color, kindOfShip, dataOfTheShip){
	var correctCell = false;
	var letter = cellNumber.split("")[0];
	var num1 = cellNumber.split("")[1];
	var num2 = cellNumber.split("")[2];
	if (num2){
		var finalNum = num1+num2;
	} else {
		var finalNum = num1;
	}
	var number = Number(finalNum)-position;
	var newPosition = 0;
	checkCells();
	function checkCells (){
		for (var i=0; i<longOfShip; i++){
			var numberOfCell = number+i;
			var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			if(numberOfCell>10){
				correctCell = false;
			} else {
				correctCell = true;
			}
		}
		if (correctCell == true){
			if (itIsInsideTheGrid){
				removeFromTheGrid(kindOfShip, color);
			};
			printNewShip();
		} else {
			alert ("you can't put a ship here");
		}
	}
	function printNewShip (){
		for (var i=0; i<longOfShip; i++){
			var numberOfCell = number+i;
			var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			var image= document.createElement("img");
			image.setAttribute("src", "images/ship.png");
			image.setAttribute("data-position", newPosition);
			finalCell.classList.add("shipToDrag", color);
			finalCell.setAttribute("draggable", true);
			finalCell.setAttribute("ondragstart", "drag(event)");
			finalCell.setAttribute("data-name", kindOfShip);
			finalCell.setAttribute("data-occupied", "yes");
			finalCell.removeAttribute("ondrop", "drop(event)");
			finalCell.removeAttribute("ondragover", "allowDrop(event)");
			finalCell.appendChild(image);
			if (!itIsInsideTheGrid){
				dataOfTheShip.style.position
				dataOfTheShip.style.position ="absolute";
				dataOfTheShip.style.top ="-666px";
			}
			newPosition++;
		}
	}
}

function removeFromTheGrid (kindOfShip, color){
	var a = document.querySelectorAll('td[data-name='+kindOfShip+']');
	for (var td of a){
		td.classList.remove(color);
		td.classList.remove("shipToDrag");
		td.removeAttribute("draggable", true);
		td.removeAttribute("ondragstart", "drag(event)");
		td.removeAttribute("data-name", kindOfShip);
		td.setAttribute("ondrop", "drop(event)");
		td.removeAttribute("data-occupied", "yes");
		td.setAttribute("ondragover", "allowDrop(event)");
		td.removeChild(td.children["0"]);
	}
}
