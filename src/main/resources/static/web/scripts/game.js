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
			console.log (data);
			createTable (10, document.getElementById("userTable"), "userCell");
			createTable (10, document.getElementById("salvoTable"), "salvoesCell");
			getShips();
			getGamePlayersInfo();
			getSalvoes();
			hideloading();
			$('#backButton').on("click", goBack);

			function goBack() {
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

			function getShips(){
				var shipsInfo = data.Ships;
				if (shipsInfo.length==0){
					$("#addShips").removeClass("hidden");
				} else {
					for (var y=0; y<shipsInfo.length; y++){
						var oneShipInfo = shipsInfo[y];
						var oneShipLocations = oneShipInfo.Locations;
						for (var x = 0; x<oneShipLocations.length; x++){
							var thisClass = "colored"+(oneShipInfo.Type.split(" ", 1));
							var location = oneShipLocations[x];
							$("[usercell="+location+"]").addClass(thisClass);
							$("[usercell="+location+"]").addClass("locatedShip");
							$('#sendSalvosButtonSpace').removeClass("hidden");
						}
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
				var Hits = data.Hits;
				for (var i in Salvoes){
					if (Salvoes[i].GamePlayer == gamePlayerID){
						printSalvos (Salvoes[i].Salvoes, "salvoesCell", Hits);
					} else {
						printSalvos (Salvoes[i].Salvoes, "userCell");
					}
				}
			}

			function printSalvos (whomSalvos, where, hits) {
				//				console.log (where);
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
				//				var allShips = [];

				var cellsLong;
				for (var i in hits){
					console.log (hits[i]);
					var everyShip = {name, length};
					var turn = hits[i].turn;
					console.log (turn);
					var kindOfShip = hits[i].typeOfShip;
					calculateLongOfShip (kindOfShip);
					var cell = hits[i].cell;
					console.log ("the cell", cell);
					$("["+where+"="+cell+"]").addClass("hittedShip");
					$("["+where+"="+cell+"]").attr("data-type", kindOfShip);
					var turnText = document.createElement ('p');
					turnText.append(turn);
					var child = $("["+where+"="+cell+"]").children("div");
					child.append(turnText);
					checkSunk(hits);
				}

				function checkSunk(hits){
					console.log ("hits", hits);
					for (var i in hits){
						if (hits[i].sunk){
							console.log (hits[i].typeOfShip, "has been sunk");
							$("[data-type='"+hits[i].typeOfShip+"']").addClass("sunkShip")
//							console.log ("cells", cells);
//							for (var y in cells){
//							}
//							cells.forEach(function(element){
//								console.log (element);
//							})
			//							for (var y in cells){
			//								console.log (cells[y]);
			////								cells[y].classList.add("sunkShip");
			//							}
						}

					}
				}

				function calculateLongOfShip (kindOfShip){
					if (kindOfShip == "Destroyer"){
						cellsLong = 3;
					} else if(kindOfShip == "Submarine"){
						cellsLong = 3;
					} else if (kindOfShip == "Carrier"){
						cellsLong = 5;
					} else if (kindOfShip == "Battleship"){
						cellsLong = 4;
					} else if (kindOfShip == "Patrol Boat"){
						cellsLong = 2;
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
		var objectBattleship = {type: "Battleship", locations: []};
		var objectPatrol = {type: "Patrol", locations: []};
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
			} else if(attribute == "Battleship"){
				objectBattleship.locations.push(usercell);
			} else if(attribute == "Patrol"){
				objectPatrol.locations.push(usercell);
			} 
		}
		listOfShips.push(objectDestroyer, objectSubmarine, objectCarrier, objectBattleship, objectPatrol);
		var correctData = true;
		for (var i =0; i<listOfShips.length; i++){
			if (listOfShips[i].locations.length == 0){
				correctData = false;
			} 
		}
		if (correctData == true){
			sendShips(listOfShips);
		} else{
			alert ("put all the ships!");
		}
	});

	function sendShips (ships){
		$.ajax({
			data: JSON.stringify(ships),
			contentType: "application/json",
			//			timeout: 1000,
			type: 'POST',
			url: '/api/games/players/'+gamePlayerID+'/ships'
		}).done(function(data, textStatus, jqXHR){
			location.reload();
		}).fail(function(data, textStatus, jqXHR){
			alert("incorrect data");
			location.reload();
		})
	}

	///SEND SALVOS

	var salvoesCells = document.querySelector(".salvoesTable");

	salvoesCells.addEventListener("click", function(e){
		var cell = e.target;
		if (cell.classList.contains("shotPendant")){
			cell.classList.remove("shotPendant");
			cell.removeAttribute("data-shooted", "yes");
		} else {
			var shotCells = $(".shotPendant");
			if (shotCells.length > 4){
				alert ("only 5!!!!");
			} else {
				if(cell.tagName=="P"){
					cell = cell.parentElement;
				} 
				if(cell.tagName=="DIV"){
					cell = cell.parentElement;
				}
				if (cell.classList.contains("salvoes") || cell.classList.contains("hittedShip")){
					alert ("you have already shot here");
				} else if (cell.tagName =="TD"){
					cell.classList.add("shotPendant");
					cell.setAttribute("data-shooted", "yes");
				}
			}
		}
	});

	$('#sendSalvosButton').click(function(){
		var listOfShoots = {locations: []};
		var shoots = $("[data-shooted=yes]");
		for (var i = 0; i<shoots.length; i++){
			var cellNumber = shoots[i].getAttribute("salvoescell");
			listOfShoots.locations.push(cellNumber);
		}
		if (listOfShoots.locations.length > 5){
			alert ("you can only send 5 shoots at once")
		} else {
			console.log(listOfShoots);
			sendSalvos(listOfShoots);
		}
	})

	function sendSalvos (listOfShoots){
		$.ajax({
			data: JSON.stringify(listOfShoots),
			contentType: "application/json",
			type: 'POST',
			url: '/api/games/players/'+gamePlayerID+'/salvos'
		}).done(function(data, textStatus, jqXHR){
			location.reload();
		}).fail(function(data, textStatus, jqXHR){
			alert("incorrect data");
		})
	}
});

///DRAG AND DROP
var elementDragging;
var itIsInsideTheGrid;
var position;
var long;
var style;
var forbidden = false;
var orientationChanged = false;

document.addEventListener("dragenter", function(ev) {
	takeLongOfShip(elementDragging);
	if (elementDragging){
		if (elementDragging.tagName == "TD"){
			var cell = elementDragging.getAttribute("usercell");
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
			//			removeDataOccupied();
			//			function removeDataOccupied (){
			//				for (var i=0; i<long; i++){
			//					var numberOfCell = number+i;
			//					var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			//					finalCell.removeAttribute("data-occupied");
			//				}
			//			}
		}
	}
}, false);

document.addEventListener("dragover", function(ev) {
	if (elementDragging){
		if (ev.target.tagName == "DIV" && elementDragging.getAttribute("style") == "opacity: 0.5;"){
			forbidden = true;
		} else if (ev.target.tagName == "TD"){
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
			//			if (elementDragging.getAttribute("position") == "vertical"){
			//				checkCellsVertical();
			//			} else {
			checkCellsHorizontal();
			//			}

			function checkCellsHorizontal (){
				for (var i=0; i<long; i++){
					var numberOfCell = number+i;
					var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
					if(numberOfCell>10 || numberOfCell <1){
						forbidden = true;
					} else if (finalCell.getAttribute("data-occupied")=="yes"){
						forbidden = true;
					} else if (elementDragging.getAttribute("style") == "opacity: 0.5;"){
						forbidden = true;
					}else {
						forbidden = false;
					}
				}
				if (forbidden){
					paintTheCellsDuringDrag(ev, "");
					return
				} else {
					paintTheCellsDuringDrag(ev, "#001a33");
				}
			}

			//			function checkCellsVertical (){
			//				for (var i=0; i<long; i++){
			//					var numberOfCell = number+i;
			//					var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			//					if(numberOfCell>10 || numberOfCell <1){
			//						forbidden = true;
			//					} else if (finalCell.getAttribute("data-occupied")=="yes"){
			//						forbidden = true;
			//					} else if (elementDragging.getAttribute("style") == "opacity: 0.5;"){
			//						forbidden = true;
			//					}else {
			//						forbidden = false;
			//					}
			//					function nextChar(letter) {
			//						return String.fromCharCode(letter.charCodeAt(0) + 1);
			//					}
			//					letter = nextChar(letter);
			//				}
			//				if (forbidden){
			//					paintTheCellsDuringDrag(ev, "");
			//					//					return
			//				} else {
			//					paintTheCellsDuringDrag(ev, "#001a33");
			//				}
			//			}
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
	if (elementDragging){
		var kindOfShip = elementDragging.getAttribute("data-name");
		if (kindOfShip == "Destroyer"){
			long = 3;
		} else if(kindOfShip == "Submarine"){
			long = 3;
		} else if (kindOfShip == "Carrier"){
			long = 5;
		} else if (kindOfShip == "Battleship"){
			long = 4;
		} else if (kindOfShip == "Patrol"){
			long = 2;
		}
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
		//		if (elementDragging.getAttribute("position") =="vertical"){
		//			for (var i=0; i<long; i++){
		//				var finalCell = document.querySelector("[userCell='"+letter+finalNum+"']");
		//				if (finalCell){
		//					finalCell.style.background = color;	
		//				}
		//				function nextChar(letter) {
		//					return String.fromCharCode(letter.charCodeAt(0) + 1);
		//				}
		//				letter = nextChar(letter);
		//			}
		//		} else {
		for (var i=0; i<long; i++){
			var numberOfCell = finalNum+i;
			var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
			if (finalCell){
				finalCell.style.background = color;	
			}

		}
		//		}

	}
}

function paintTheCellsDuringDrag (ev, color){
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
		position = Number(ev.target.getAttribute("data-position"));
	} else {
		itIsInsideTheGrid = true;
		position = Number(elementDragging.getAttribute("data-position"));
	}
	var imageWidth = 46;
	var xPosition = position * imageWidth + (imageWidth/2);
	var dataName = ev.target.parentNode.getAttribute("data-name");
	var ghost = document.getElementById(dataName);
	//	if (elementDragging.getAttribute("position")=="vertical"){
	//		ghost.classList.add("rotate");
	//	}
	ev.dataTransfer.setDragImage(ghost, xPosition, imageWidth/2);
}

function drop(ev) {
	paintTheCellsDuringDrag(ev, "");
	ev.preventDefault();
	if (elementDragging){
		var cellInfo = ev.target;
		var kindOfShip = elementDragging.getAttribute("data-name");
		takeLongOfShip (cellInfo, kindOfShip);
		printAShip (cellInfo, kindOfShip, elementDragging);
	}
}

function printAShip(cellInfo, kindOfShip, elementDragging, changing){
	var color = "colored"+kindOfShip;
	var cellNumber = cellInfo.getAttribute("userCell");
	if (forbidden == false){
		var occupied = false;
		var letter = cellNumber.split("")[0];
		var num1 = cellNumber.split("")[1];
		var num2 = cellNumber.split("")[2];
		if (num2){
			var finalNum = num1+num2;
		} else {
			var finalNum = num1;
		}
		var number = Number(finalNum)-position;
		if (cellInfo.getAttribute("position") == "horizontal" || changing == "changingToVertical"){
			checkOverlappingVertical(letter);
			if (occupied != true){
				printVerticalShip(letter);
			} else {
				alert ("wrong location in checkOverlappingVertical");
			}

			function checkOverlappingVertical(letter){
				var newPosition = 0;
				var name = cellInfo.getAttribute("data-name");
				for (var i=0; i<long; i++){
					var numberOfCell = number+i;
					var finalCell = document.querySelector("[userCell='"+letter+number+"']");
					var image= document.createElement("img");
					if (!finalCell){
						occupied = true;
					} else {
						if (finalCell.getAttribute("data-occupied")=="yes" && newPosition != 0){
							occupied = true;
						} else if (letter == "K"){
							occupied = true;
						}
					}

					function nextChar(letter) {
						return String.fromCharCode(letter.charCodeAt(0) + 1);
					}
					letter = nextChar(letter);
					newPosition++;
				}
			}

			function printVerticalShip(letter){
				console.log ("printing vertical");
				console.log (letter);
				console.log (number);
				//				var newPosition = 0;
				var name = cellInfo.getAttribute("data-name");
				removeFromTheGrid (name, color);
				for (var i=0; i<long; i++){
					console.log ("entering the loop")
					console.log (letter);
					console.log (number)
					var finalCell = document.querySelector("[userCell='"+letter+number+"']");
					var image= document.createElement("img");
					image.setAttribute("src", "images/ship.png");
					//					image.setAttribute("data-position", i);
					finalCell.classList.add("shipToDrag", color);
					finalCell.setAttribute("draggable", true);
					finalCell.setAttribute("orientation", "vertical");
					finalCell.setAttribute("data-position", i);
					finalCell.setAttribute("ondragstart", "drag(event)");
					finalCell.setAttribute("data-name", kindOfShip);
					finalCell.setAttribute("data-occupied", "yes");
					finalCell.removeAttribute("ondrop", "drop(event)");
					finalCell.removeAttribute("ondragover", "allowDrop(event)");
					finalCell.appendChild(image);
					finalCell.addEventListener('click', changeOrientation);
					function nextChar(letter) {
						return String.fromCharCode(letter.charCodeAt(0) + 1);
					}
					letter = nextChar(letter);
				}
			}
		} else {
			checkOverlappingHorizontal (number);
			if (occupied != true){
				printHorizonalShip(number);
			} else {
				alert ("wrong location in checkOverlappingHorizontal");
			}
		}

		function checkOverlappingHorizontal(number){
			var position = Number(cellInfo.getAttribute("data-position"));
			occupied = false;
			var newPosition = 0;
			var name = cellInfo.getAttribute("data-name");
			for (var i=0; i<long; i++){
				var numberOfCell = number+i;
				var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
				if (finalCell){
					if (newPosition!=0 && finalCell.getAttribute("data-occupied") == "yes"){
						occupied = true;
					} else if (numberOfCell >= 11 || numberOfCell <=0){						
						occupied = true;
					}
				} else {
					occupied = true;	
				}
				newPosition++;
			}
		}

		function printHorizonalShip(number){
			var newPosition = 0;
			removeFromTheGrid (kindOfShip, color);
			for (var i=0; i<long; i++){
				var numberOfCell = number+i;
				var finalCell = document.querySelector("[userCell='"+letter+numberOfCell+"']");
				var image= document.createElement("img");
				image.setAttribute("src", "images/ship.png");
				//				image.setAttribute("data-position", newPosition);
				finalCell.classList.add("shipToDrag", color);
				finalCell.setAttribute("draggable", true);
				finalCell.setAttribute("data-position", i);
				finalCell.setAttribute("orientation", "horizontal");
				finalCell.setAttribute("ondragstart", "drag(event)");
				finalCell.setAttribute("data-name", kindOfShip);
				finalCell.setAttribute("data-occupied", "yes");
				finalCell.removeAttribute("ondrop", "drop(event)");
				finalCell.removeAttribute("ondragover", "allowDrop(event)");
				finalCell.appendChild(image);
				finalCell.addEventListener('click', changeOrientation);
				if (elementDragging && !itIsInsideTheGrid){
					elementDragging.style.opacity = 0.5;
					elementDragging.removeAttribute("draggable", true);
					elementDragging.removeAttribute("ondragstart", "drag(event)");
				}
			}
			newPosition++;
		}
	}
	cleanData();
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
		td.removeAttribute("ondragstart", "drag(event)");
		td.removeAttribute("data-name", kindOfShip);
		td.removeAttribute("data-position");
		td.removeAttribute("orientation", "horizontal");
		td.removeAttribute("data-occupied", "yes");
		td.removeEventListener('click', changeOrientation);
		td.setAttribute("draggable", false);
		td.setAttribute("ondrop", "drop(event)");
		td.setAttribute("ondragover", "allowDrop(event)");
		td.removeChild(td.children["0"]);
	}
}

function changeOrientation(e){
	var element = e.path[1];
	takeLongOfShip(element);
	var orientation = element.getAttribute("orientation");
	var kindOfShip = element.getAttribute("data-name");
	if (orientation=="horizontal"){
		var changing = "changingToVertical";
		printAShip(element, kindOfShip, null, changing);
	} else if (orientation=="vertical"){
		var changing = "changingToHorizontal";
		printAShip(element, kindOfShip, null, changing);
	}
}