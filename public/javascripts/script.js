$(document).ready(function() {
	var server = io.connect('http://localhost:3000');

	// Print the modal for login
	$('#myModal').modal('toggle');
	$("#check-name").click(function (e){
		e.preventDefault();
		var name = $("#name").val();
		if (name === '' || name === undefined) {
			$(".control-group").addClass('error');
			$(".controls span").fadeToggle();
		}
		else {
			$('#myModal').modal('toggle');
			server.emit('login', name);
		}
	});

	// Send message && check value of the field
	$("button#chat").click(function (e){
		e.preventDefault();
		var message = $("input.messageField").val();

		if (message === '')
		{
			$(".error").slideDown();
		}
		else {
			server.emit('messages', message);
			$(".messageField").val('');
		}
    });

	var list_message = [];
	
	

	server.on('new-user', function (user) {
		$("ul").append("<li id="+user.id+">"+user.name+"</li>");
   		$("div.messages-list").append("<br /><p class='text-info'><em>"+ user.name +" is connected.</em></p>");
   	});

    server.on('messages', function (data) {
   		$("div.messages-list").append("<br />"+data);
   	});
   	
   	server.on('disconnect', function (user) {
   		$("li#"+user.id).remove();
   		$("div.messages-list").append("<br /><p class='text-info'><em>"+ user.name +" is disconnected.</em></p>");
   	});

	
});