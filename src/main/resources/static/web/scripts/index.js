$( document ).ready(function() {
	var loggedInPlayerInfo;
	checkLoggedIn ();

	//get data for leaderboard
	$.ajax( "/api/leaderboard")
		.done(function(data) {
		var tableSpace = $('#leaderboardTable');
		var leaderboardData = data;
		printleaderBoard(tableSpace, leaderboardData);
		hideloading();
	});

	$('#loginbutton').click(function(event){
		login (event);
	});

	$(document).keypress(function(e) {
		if(e.which == 13) {
			login (event);
		}
	});

	$('#signUpform').click(function (event) {
		postSignUpAjax(event);
	});

	$('#logoutbutton').click(function (event) {
		event.preventDefault();
		$.ajax({
			timeout: 1000,
			type: 'POST',
			url: '/api/logout'
		}).done(function(data, textStatus, jqXHR) {
			logOut();
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert('Not logged out!');
		});
	});

	$("#signUp").click(function() {
		openNewWindow();
	});

	$('#closeButton').click (function(event) {
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
	});

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		var modal = document.getElementById('myModal');
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	$("#showPasswordLogin").click(function( event ) {
		event.preventDefault();
		showPassword('passwordLogin', 'eyeOpenLogin', 'eyeCloseLogin');
	}); 

	$("#showPasswordSignUp").click(function( event ) {
		event.preventDefault();
		console.log ("hello");
		showPassword('passwordSignUp', 'eyeOpenSignUp', 'eyeCloseSignUp');
	}); 

	function hideloading (){
		$('#content').removeClass("hidden");
		$('#loadingmessage').addClass("hidden");
	};

	function printleaderBoard(tableSpace, leaderboardData){
		//create the header of the table
		var table = document.createElement ('table');
		tableSpace.append(table);
		var thead = document.createElement ('thead');
		table.append (thead);
		var tbody = document.createElement ('tbody');
		table.append (tbody);
		var header = document.createElement ('tr');
		thead.append (header);
		var thPosition = document.createElement ('th');
		thPosition.innerHTML = "Position";
		header.append(thPosition);
		var thName = document.createElement ('th');
		thName.innerHTML = "Name";
		header.append(thName);
		var thTotal = document.createElement ('th');
		thTotal.innerHTML = "Total";
		header.append(thTotal);
		var thWin = document.createElement ('th');
		thWin.innerHTML = "Wins";
		header.append(thWin);
		var thTie = document.createElement ('th');
		thTie.innerHTML = "Ties";
		header.append(thTie);
		var thLose = document.createElement ('th');
		thLose.innerHTML= "Loses";
		header.append(thLose);

		for (var i = 0; i<leaderboardData.length; i++){
			//create elements for the body of the table
			var row = document.createElement ('tr');
			tbody.append(row);
			//create each position
			var positionCell = document.createElement ('td');
			var positionDiv = document.createElement ('div');
			var positionText = document.createElement ('p');
			positionText.innerHTML = i+1;
			positionDiv.append (positionText);
			positionDiv.classList.add("positionDiv");
			positionCell.append (positionDiv);
			positionCell.classList.add("position");
			row.append(positionCell);
			//create each name
			var nameCell = document.createElement ('td');
			nameCell.innerHTML = leaderboardData[i].Player;
			row.append(nameCell);
			//create each total
			var totalCell = document.createElement ('td');
			totalCell.innerHTML = leaderboardData[i]["Total"];
			row.append(totalCell);
			//create each wins
			var winsCell = document.createElement ('td');
			winsCell.innerHTML = leaderboardData[i].Wins;
			row.append(winsCell);
			//create each ties
			var tiesCell = document.createElement ('td');
			tiesCell.innerHTML = leaderboardData[i].Tie;
			row.append(tiesCell);
			//create each loses
			var losesCell = document.createElement ('td');
			losesCell.innerHTML = leaderboardData[i].Lose;
			row.append(losesCell);

		}
	}

	function checkLoggedIn () {
		$.ajax( "/api/games").done(function(data){
			var playerInfo = data.Player;
			if (playerInfo!=null){
				$("#login-form").addClass("hidden");
				$('#logoutform').removeClass("hidden");
				$('#loginform').addClass("hidden");
				$("#greetings").text("Hello, "+ data.Player.Mail).removeClass("hidden");
				loggedInPlayerInfo = playerInfo;
				playButtonOn();
			} else {
				$("#login-form").removeClass("hidden");
				$('#logoutform').addClass("hidden");
				$('#loginform').removeClass("hidden");
				$("#greetings").addClass("hidden");
			}
		})
	}

	function playButtonOn(){
		$('#playButton').removeClass("hidden");
	}

	function logOut () {
		$("#login-form").removeClass("hidden");
		$('#logoutform').addClass("hidden");
		$('#loginform').removeClass("hidden");
		$("#greetings").addClass("hidden");
		$('#playButton').addClass("hidden");
	}

	/* jQuery Validate Emails with Regex */
	function validateEmail(Email) {
		var pattern = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
		return $.trim(Email).match(pattern) ? true : false;
	}

	/* create data from the login and check it */
	function login (event) {
		event.preventDefault();
		//.replace(/\s+/g, '') to avoid WHITE SPACES;
		var usernameInput = $('#username').val().replace(/\s+/g, '');
		var passwordInput = $('#passwordLogin').val().replace(/\s+/g, '');
		var data = 'username=' +usernameInput + '&password=' + passwordInput;
		postLoginAjax (data, usernameInput, passwordInput);
		//		printTableGame();
	};

	function postLoginAjax(data, usernameInput, passwordInput){
		$.ajax({
			data: data,
			timeout: 1000,
			type: 'POST',
			url: '/api/login'
		}).done(function(data, textStatus, jqXHR) {
			checkLoggedIn ();
			$('#username, #passwordLogin').val('');
		}).fail(function(jqXHR, textStatus, errorThrown) {
			if (usernameInput.length === 0 || passwordInput.length === 0){
				alert("Try entering an email and a password");
			} else {
				alert("Wrong credentials, try again or sign in!");
			}
		});
	}

	/* create a new player */
	function postSignUpAjax(event){
		var newEvent = event
		event.preventDefault();
		//.replace(/\s+/g, '') to avoid WHITE SPACES;
		var usernameInput = $('#usernameSignUp').val().replace(/\s+/g, '');
		var passwordInput = $('#passwordSignUp').val().replace(/\s+/g, '');
		var dataInput = 'username=' +usernameInput + '&password=' + passwordInput;
		var result = validateEmail(usernameInput);
		if(result == false) {
			alert ("Enter a correct mail");
			return;
		}
		$.ajax({
			data: dataInput,
			timeout: 1000,
			type: 'POST',
			url: '/api/players'
		}).done(function(data, textStatus, jqXHR) {
			if (usernameInput.length === 0 && passwordInput.length === 0){
				alert("Try entering an email and a password");
			} else {
				var modal = document.getElementById('myModal');
				modal.style.display = "none";
				$('#usernameSignUp, #passwordSignUp').val('');
				postLoginAjax (dataInput,usernameInput,passwordInput);
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert("You are already signed up");
		});
	};

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
});