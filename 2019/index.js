$(function() {
	$.getJSON("json", function(data) {
		// Populating leaderboards
		var top = data.leaderboard.top;
		var snipers = data.leaderboard.snipers;
		var sniped = data.leaderboard.sniped;
		var leaderboardBody = $("#leaderboard-body");
		

		for (var i = 0; i < top.length && i < 5; i++) {
			var user = top[i];
			$("<tr><th scope='row'>" + (i + 1) + "</th><td class='user-name'>" + user.name + "</td><td>" + user.score + "</td></tr>").appendTo(leaderboardBody);
		}
		var snipersBody = $("#snipers-body");
		for (var i = 0; i < snipers.length && i < 5; i++) {
			var user = snipers[i];
			$("<tr><th scope='row'>" + user.snipes + "</th><td class='user-name'>" + user.name + "</td><td>" + lookupUserRank(user.id, top) + "</td></tr>").appendTo(snipersBody);
		}
		var snipedBody = $("#sniped-body");
		for (var i = 0; i < sniped.length && i < 5; i++) {
			var user = sniped[i];
			$("<tr><th scope='row'>" + user.sniped + "</th><td class='user-name'>" + user.name + "</td><td>" + lookupUserRank(user.id, top) + "</td></tr>").appendTo(snipedBody);
		}

		// User Searches
		var form = $("#user-lookup-form");
		form.submit(function(event) {
			event.preventDefault();
			var searchBox = $("#user-lookup-searchbox");
			var usernameSearch = searchBox.val();
			showUserModal(usernameSearch, data);
		});
		$(".user-name").click(function() {
			var userName = $(this).html();
			showUserModal(userName, data);
		});

	})
	.done(function() {
		$("#loading-alert").hide();
	})
	.fail(function() {
		$("#loading-alert").removeClass('alert-primary');
		$("#loading-alert").addClass('alert-danger');
		$("#loading-alert").html("An error ocurred. Please <a href='.'>refresh the page.</a>");
	});
});

function lookupUserRank(uid, top) {
	for (var i = 0; i < top.length; i++) {
		if (top[i].id == uid) {
			return i + 1;
		}
	}
	return -1;
}

function showUserModal(usernameSearch, data) {
	var searchModal = $("#search-modal");
	var usernameDOM = $("#search-modal-username");
	var rankDOM = $("#search-modal-rank");
	var snipesDOM = $("#search-modal-snipes");
	var snipedDOM = $("#search-modal-sniped");
	if (usernameSearch === "") return;
	var users = Object.values(data.users);
	for (var i = 0; i < users.length; i++) {
		var usr = users[i];
		if (usr.name.includes(usernameSearch)) {
			usernameDOM.html(usr.name);
			var rank = lookupUserRank(usr.id, data.leaderboard.top);
			console.log("RANK: " + rank + " for " + usr.id);
			if (rank > 0) {
				rankDOM.html(rank);
			} else {
				rankDOM.html("??");
			}
			snipesDOM.html(usr.snipes);
			snipedDOM.html(usr.sniped);
			searchModal.modal('show');
			return;
		}
	}
	alert("User not found!");
}