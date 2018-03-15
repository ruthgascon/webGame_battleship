$( document ).ready(function() {
	var loggedInPlayerInfo;
	checkLoggedIn ();
	var gameTableSpace = $('#GamesTable');
	var generalData;

	$.ajax( "/api/games" )
		.done(function(data) {
		generalData = data;
		var games = data.Games;
		printTableGame(games, gameTableSpace);
		hideloading();
	});

	$('#newGameButton').click (function(event){
		event.preventDefault();
		newGame ();
	})

	function hideloading (){
		$('#content').removeClass("hidden");
		$('#loadingmessage').addClass("hidden");
	};

	function printTableGame(games, gameTableSpace){
		var match = false;
		var table = document.createElement ('table');
		gameTableSpace.append(table);
		var thead = document.createElement ('thead');
		var tbody = document.createElement ('tbody');
		table.append(thead, tbody);
		var tr = document.createElement ('tr');
		thead.append (tr);
		var th1 = document.createElement ('th');
		var text1 = document.createTextNode('Game ID');
		th1.appendChild(text1);
		var th2 = document.createElement ('th');
		var text2 = document.createTextNode('Created');
		th2.appendChild(text2);
		var th3 = document.createElement('th');
		var text3 = document.createTextNode('Player1');
		th3.appendChild(text3);
		var th4 = document.createElement('th');
		var text4 = document.createTextNode('Player2');
		th4.appendChild(text4);
		tr.append(th1, th2, th3, th4);
		for (var i = 0; i<games.length; i++){
			var row = document.createElement ('tr');
			//formating created date with MOMENT
			var initialTime = games[i]["Created Data"];
			var formatedTime = moment(initialTime).format('MMMM Do YYYY, h:mm:ss a');
			tbody.append (row);
			var td1 = document.createElement('td');
			var text1 = document.createTextNode(games[i]["Game ID"]);
			td1.appendChild(text1);
			var td2 = document.createElement('td');
			var text2 = document.createTextNode(formatedTime);
			td2.appendChild (text2);
			row.append (td1,td2);
			match = false;
			for (var everyGamePlayer in games[i]["Game Players"]){
				eachGamePlayer = games[i]["Game Players"][everyGamePlayer].Player;
				var id = eachGamePlayer["Player ID"];
				//The player is the same as the logged IN??
				if (loggedInPlayerInfo["Player ID"] == id) {
					var mail = "you";
					match = true;
					GPID = games[i]["Game Players"][everyGamePlayer]["Game Player ID"];
				} else {
					var mail = eachGamePlayer.Email;
				}
			
				var td = document.createElement('td');
				var text = document.createTextNode(mail);
				td.appendChild (text);
				row.append(td);
				if (games[i]["Game Players"].length ==1){
					var tdEmpty = document.createElement('td');
					if (mail == "you"){
						var text2 = document.createTextNode("WAITING...");
						tdEmpty.appendChild(text2);
					} else{
						var a = document.createElement ('a');
						var text2 = document.createTextNode("JOIN");
						a.appendChild (text2);
						tdEmpty.appendChild (a);
						var ID = games[i]["Game ID"];
						a.setAttribute("data-game", ID);
						a.setAttribute("class", "joinButton");
					}
					row.append(tdEmpty);
						
				}
			}
			var td = document.createElement('td');
			td.classList.add("playColumn");
			var icon = document.createElement('i');
			//if the 
			if (match == true){
				icon.classList.add("fas","fa-play");

				var a = document.createElement('a');
				var linkText = document.createTextNode("my title text");
				a.appendChild(icon);
				a.title = "game";
				a.href = "game.html?gp="+GPID;
				
				td.appendChild (a);
			} else {
				icon.classList.add("fas","fa-times");
				td.appendChild (icon);
			}

			row.append(td);
		}
		var classname = document.getElementsByClassName("joinButton");

		for (var i = 0; i < classname.length; i++) {
			classname[i].addEventListener('click', joinGame, false);
		}
	}

	function checkLoggedIn () {
		$.ajax( "/api/games").done(function(data){
			var playerInfo = data.Player;
			if (playerInfo!=null){
				$("#greetings").text("Hello, "+ data.Player.Mail).removeClass("hidden");
				loggedInPlayerInfo = playerInfo;
			} else {
				$("#greetings").addClass("hidden");
			}
		})
	}

	function openNewWindow (){
		$('#username, #passwordLogin').val('');
		var modal = document.getElementById('myModal');
		modal.style.display = "block";
	}

	function showPassword(password, icon1, icon2) {
		var x = document.getElementById(password);
		var eyeOpen = document.getElementById(icon1);
		var eyeClosed = document.getElementById(icon2);
		if (x.type === "password") {
			x.type = "text";
			eyeOpen.classList.add("hidden");
			eyeClosed.classList.remove("hidden");
		} else {
			x.type = "password";
			eyeClosed.classList.add("hidden");
			eyeOpen.classList.remove("hidden");
		}
	}

	function newGame (){
		$.ajax({
			timeout: 1000,
			type: 'POST',
			url: '/api/games'
		}).done(function(data, textStatus, jqXHR){
			gameTableSpace.empty();
			printTableGame(data.Games, gameTableSpace);
		})
	}

	var joinGame = function() {
		var gameID = this.getAttribute("data-game");
		$.ajax({
			timeout: 1000,
			type: 'POST',
			url: '/api/games/'+gameID+'/players',
			statusCode: {
				403: function() {
					console.log ("DO SOMETHING");
				}
			}
		}).done(function(data, textStatus, jqXHR){
			var GPID = (data.GamePlayerID);
			goToGame (GPID);
		})
	};

	function goToGame (GPID){
		document.location.href = 'game.html?gp='+GPID ;
	}

});