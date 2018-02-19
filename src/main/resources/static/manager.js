$(function() {

	// display text in the output area
	function showOutput(text) {
		$("#output").text(text);
	}

	// load and display JSON sent by server for /players
	//.srtingify (data=valor que se convierte en cadena JSON, null= funcion reemplazo, todo es incluido en la cadena JSON, 2= espacio en cadenaJSON

	function loadData() {
		$.get("/players")
			.done(function(data) {
			showOutput(JSON.stringify(data, null, 2));
		})
			.fail(function( jqXHR, textStatus ) {
			showOutput( "Failed: " + textStatus );
		});
	}

	// handler for when user clicks add person

	function addPlayer() {
		var name = $("#email").val();
		if (name) {
			postPlayer(name);
		}
	}

	// code to post a new player using AJAX
	// on success, reload and display the updated data from the server

	function postPlayer(userName) {
		//		The URL is exactly the same as loadData(). The difference in back-end behavior is based on GET versus POST.
		//		It adds a Content-Type header to the request to tell the back-end JSON is coming.
		//		It uses JSON.stringify() to convert a JavaScript into a valid JSON string.
		$.post({
			headers: {
				'Content-Type': 'application/json'
			},
			dataType: "text",
			url: "/players",
			data: JSON.stringify({ "userName": userName })
		})
			.done(function( ) {
			showOutput( "Saved -- reloading");
			loadData();
		})
			.fail(function( jqXHR, textStatus ) {
			showOutput( "Failed: " + textStatus );
		});
	}

	$("#add_player").on("click", addPlayer);

	loadData();
});