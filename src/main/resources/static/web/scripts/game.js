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
				if (shipsInfo.length==0){
					$("#addShips").removeClass("hidden");
				}
				for (var y=0; y<shipsInfo.length; y++){
					var oneShipInfo = shipsInfo[y];
					var oneShipLocations = oneShipInfo.Locations;
					for (var x = 0; x<oneShipLocations.length; x++){

						var thisClass = "colored"+(oneShipInfo.Type.split(" ", 1));
						var location = oneShipLocations[x];
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
		$('#addShips').addClass("hidden");
		$('#sendShips').removeClass("hidden");
		$('#sendShipsButtonSpace').removeClass("hidden");
	});

	$('#sendShipsButton').on("click", function(){
		var listOfShips = [];
		var objectDestroyer = {type: "Destroyer", locations: []};
		var objectSubmarine = {type: "Submarine", locations: []};
		var objectCarrier = {type: "Carrier", locations: []};
		var objectBattleShip = {type: "Battleship", locations: []};
		var objectPatrolBoat = {type: "Patrol Boat", locations: []};
		var x = $("[data-occupied=yes]");
		for (var i = 0; i<x.length; i++){
			var usercell = x[i].getAttribute("usercell");
			var attribute = x[i].getAttribute("data-name");
			if (attribute == "Destroyer"){
				objectDestroyer.locations.push(usercell);
			} else if(attribute == "Submarine"){
				objectSubmarine.locations.push(usercell);
			} else if(attribute == "Carrier"){
				objectCarrier.locations.push(usercell);
			} else if(attribute == "BattleShip"){
				objectBattleShip.locations.push(usercell);
			} else if(attribute == "PatrolBoat"){
				objectPatrolBoat.locations.push(usercell);
			} 
		}
		listOfShips.push(objectDestroyer, objectSubmarine, objectCarrier, objectBattleShip, objectPatrolBoat);
		//		console.log (listOfShips);
		for (var i =0; i<listOfShips.length; i++){
			if (listOfShips[i].locations.length == 0){
				alert ("put all the ships!");
				return;
			} else {
				sendShips(listOfShips);
			}
		}
	});

	function sendShips (ships){
		$.ajax({
			data: JSON.stringify(ships),
			contentType: "application/json",
			timeout: 1000,
			type: 'POST',
			url: '/api/games/players/'+gamePlayerID+'/ships'
		}).done(function(data, textStatus, jqXHR){
			location.reload();
		})
	}
});

///DRAG AND DROP
var elementDragging;
var itIsInsideTheGrid;
var position;
var long;
var forbidden = false;

document.addEventListener("dragenter", function(ev) {
	var cellToBe = ev.target;

	if (elementDragging.tagName == "TD"){
		elementDragging.removeAttribute("data-occupied");
//		console.log ("elementDragging on DRAGENTER", elementDragging);
		return
	}
	takeLongOfShip(elementDragging);
}, false);

document.addEventListener("dragover", function(ev) {
	if (ev.target.tagName == "TD"){
		var cell = ev.target.getAttribute("usercell");

		var letter = cell.split("")[0];
		var num1 = cell.split("")[1];
		var num2 = cell.split("")[2];
		if (num2){
			var finalNum = num1+num2;
		} else {
			var finalNum = num1;
		}
		var number = Number(finalNum)-position;
		var newPosition = 0;
		checkCells();

		function checkCells (){

			for (var i=0; i<long; i++){
				var numberOfCell = number+i;
				var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
				if(numberOfCell>10 || numberOfCell <1){
					forbidden = true;
					return
				} else if (finalCell.getAttribute("data-occupied")=="yes"){
					forbidden = true;
					return
				} else if (elementDragging.getAttribute("style") == "opacity: 0.5;"){
				
					forbidden = true;
				}else {
//					console.log (elementDragging);
//					console.log (elementDragging.getAttribute("style"));
					forbidden = false;
				}
			}
			if (forbidden){
				paintTheCellsDuringDrag(ev, "");
				alert ("You have already put this ship");
				
				return
			} else {
				paintTheCellsDuringDrag(ev, "green");
			}
		}
	}
}, false);

document.addEventListener("dragleave", function(ev) {
	paintTheCellsDuringDrag(ev, "");
}, false);

function allowDrop(ev) {
	ev.preventDefault();
}

function takeLongOfShip (elementDragging){
	var kindOfShip = elementDragging.getAttribute("data-name");
	if (kindOfShip == "Destroyer"){
		long = 3;
	} else if(kindOfShip == "Submarine"){
		long = 3;
	} else if (kindOfShip == "Carrier"){
		long = 5;
	} else if (kindOfShip == "BattleShip"){
		long = 4;
	} else if (kindOfShip == "PatrolBoat"){
		long = 2;
	}
}

function calculateCells (long, cell, color){
	if (cell){
		var letter = cell.split("")[0];
		var num1 = cell.split("")[1];
		var num2 = cell.split("")[2];
		if (num2){
			var finalNum = Number(num1+num2)-position;
		} else {
			var finalNum = Number(num1)-position;
		}
		for (var i=0; i<long; i++){
			var numberOfCell = finalNum+i;
			var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			if (finalCell){
				finalCell.style.background = color;	
			}
		}
	}
}

function paintTheCellsDuringDrag (ev, color){
	//	console.log (elementDragging);
	if (elementDragging){
		takeLongOfShip(elementDragging);
	}
	var finalUserCell = ev.target.getAttribute("userCell");
	var initialUserCell = elementDragging;

	if (ev.target.hasAttribute("ondragover", "allowDrop (event)")){
		calculateCells(long, finalUserCell, color);
	} else {
		calculateCells(long, finalUserCell, color);
	}
}

function drag(ev) {
	elementDragging = ev.currentTarget;
	if (elementDragging.tagName == "DIV"){
		itIsInsideTheGrid = false;
	} else {
		itIsInsideTheGrid = true;
	}
	position = ev.target.getAttribute("data-position");
	var imageWidth = 46;
	var xPosition = position * imageWidth + (imageWidth/2);
	var dataName = ev.target.parentNode.getAttribute("data-name");
	var ghost = document.getElementById(dataName);
	ev.dataTransfer.setDragImage(ghost, xPosition, imageWidth/2);
}

function drop(ev) {
	paintTheCellsDuringDrag(ev, "");
	ev.preventDefault();
	if (elementDragging){
		var cellInfo = ev.target;
		calculatingCells (cellInfo);
	}
}

function calculatingCells(cellInfo){
	var kindOfShip = elementDragging.getAttribute("data-name");
	var cellNumber = cellInfo.getAttribute("userCell");
	if (kindOfShip == "Destroyer"){
		printShip (3, cellNumber, "coloredDestroyer", kindOfShip, elementDragging);
	} else if(kindOfShip == "Submarine"){
		printShip(3, cellNumber, "coloredSubmarine", kindOfShip, elementDragging);
	} else if (kindOfShip == "Carrier"){
		printShip(5, cellNumber, "coloredCarrier", kindOfShip, elementDragging);
	} else if (kindOfShip == "BattleShip"){
		printShip(4, cellNumber, "coloredBattleship", kindOfShip, elementDragging);
	} else if (kindOfShip == "PatrolBoat"){
		printShip(2, cellNumber, "coloredPatrol", kindOfShip, elementDragging);
	}
}

function printShip(longOfShip, cellNumber, color, kindOfShip, elementDragging){
	//	var letter = cellNumber.split("")[0];
	//	var num1 = cellNumber.split("")[1];
	//	var num2 = cellNumber.split("")[2];
	//	if (num2){
	//		var finalNum = num1+num2;
	//	} else {
	//		var finalNum = num1;
	//	}
	//	var number = Number(finalNum)-position;
	//	var newPosition = 0;
	checkCells();

	function checkCells (){
//		console.log (elementDragging);
		if (forbidden == false){
			if (itIsInsideTheGrid){
				removeFromTheGrid(kindOfShip, color);
			};
			printNewShip();
		}
	}

	function printNewShip (){
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
		for (var i=0; i<longOfShip; i++){
			var numberOfCell = number+i;
			var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			var image= document.createElement("img");
			image.setAttribute("src", "images/ship.png");
			image.setAttribute("data-position", newPosition);
			finalCell.classList.add("shipToDrag", color);
			finalCell.setAttribute("draggable", true);
			finalCell.setAttribute("position", "horizontal");
			finalCell.setAttribute("ondragstart", "drag(event)");
			finalCell.setAttribute("data-name", kindOfShip);
			finalCell.setAttribute("data-occupied", "yes");
			finalCell.removeAttribute("ondrop", "drop(event)");
			finalCell.removeAttribute("ondragover", "allowDrop(event)");
			finalCell.appendChild(image);
			if (!itIsInsideTheGrid){
				elementDragging.style.opacity = 0.5;
				elementDragging.removeAttribute("draggable", true);
				elementDragging.removeAttribute("ondragstart", "drag(event)");
			}
			newPosition++;
		}
	}
//		cleanData();
}

function cleanData(){
	elementDragging = undefined;
}

function removeFromTheGrid (kindOfShip, color){
	var a = document.querySelectorAll('td[data-name='+kindOfShip+']');
	for (var td of a){
		td.classList.remove(color);
		td.classList.remove("shipToDrag");
		td.removeAttribute("draggable", true);
		td.setAttribute("draggable", false);
		td.removeAttribute("ondragstart", "drag(event)");
		td.removeAttribute("data-name", kindOfShip);
		td.removeAttribute("position", "horizontal");
		td.setAttribute("ondrop", "drop(event)");
		td.removeAttribute("data-occupied", "yes");
		td.setAttribute("ondragover", "allowDrop(event)");
		td.removeChild(td.children["0"]);
	}
}
