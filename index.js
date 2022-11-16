import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

$(async function () {
  // Import the functions you need from the SDKs you need

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAA4vutbfxWztwsSV7hz5yxM9EG63p9fbU",
    authDomain: "snipes-7db6b.firebaseapp.com",
    databaseURL: "https://snipes-7db6b-default-rtdb.firebaseio.com",
    projectId: "snipes-7db6b",
    storageBucket: "snipes-7db6b.appspot.com",
    messagingSenderId: "388342990351",
    appId: "1:388342990351:web:581f7cd73da4263279057a",
    measurementId: "G-R1596XXGK8",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase
  // Initialize Realtime Database and get a reference to the service
  const database = ref(getDatabase(app));

  let data;

  await get(child(database, "/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        data = snapshot.val();
      } else {
        $("#loading-alert").removeClass("alert-primary");
        $("#loading-alert").addClass("alert-danger");
        $("#loading-alert").html(
          "An error ocurred. Please <a href='.'>refresh the page</a>."
        );
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  console.log(data);

  // Populating leaderboards
  console.log("here");
  var top = data.leaderboard.top;
  var snipers = data.leaderboard.snipers;
  var sniped = data.leaderboard.sniped;
  var leaderboardBody = $("#leaderboard-body");

  // TODO: Better tie scoring?
  //var scoreToBeat = 1000;
  //var rankOfScoreToBeat = 0;
  //var lastI = -1;
  for (var i = 0; i < top.length && i < 10; i++) {
    var user = top[i];
    /*if (user.score < scoreToBeat) {
				rankOfScoreToBeat = rankOfScoreToBeat + (i - lastI);
				scoreToBeat = user.score;
				lastI = i;
			}*/
    $(
      "<tr><th scope='row'>" +
        (i + 1) +
        "</th><td class='user-name user-name-style'>" +
        escapeHtml(user.name) +
        "</td><td>" +
        user.score +
        "</td></tr>"
    ).appendTo(leaderboardBody);
  }
  var snipersBody = $("#snipers-body");
  for (var i = 0; i < snipers.length && i < 10; i++) {
    var user = snipers[i];
    $(
      "<tr><th scope='row'>" +
        user.snipes +
        "</th><td class='user-name user-name-style'>" +
        escapeHtml(user.name) +
        "</td><td>" +
        lookupUserRank(user.id, top) +
        "</td></tr>"
    ).appendTo(snipersBody);
  }
  var snipedBody = $("#sniped-body");
  for (var i = 0; i < sniped.length && i < 10; i++) {
    var user = sniped[i];
    $(
      "<tr><th scope='row'>" +
        user.sniped +
        "</th><td class='user-name user-name-style'>" +
        escapeHtml(user.name) +
        "</td><td>" +
        lookupUserRank(user.id, top) +
        "</td></tr>"
    ).appendTo(snipedBody);
  }

  var date = new Date(0);
  date.setUTCSeconds(data.lastUpdated / 1000);
  $("#info-last-updated").html(date.toLocaleString(undefined, dateOptions));
  $("#info-version").html(data.version);

  // User Searches
  var form = $("#user-lookup-form");
  form.submit(function (event) {
    event.preventDefault();
    var searchBox = $("#user-lookup-searchbox");
    var usernameSearch = searchBox.val();
    showUserModal(usernameSearch, data);
  });
  $(".user-name").click(function () {
    var userName = $(this).html();
    showUserModal(userName, data);
  });

  // Autocomplete search terms
  var users = Object.values(data.users);
  var searchTerms = [];
  for (var i = 0; i < users.length; i++) {
    searchTerms.push(users[i].name);
  }
  for (var i = 0; i < users.length; i++) {
    searchTerms.push(users[i].realName);
  }
  searchTerms = [...new Set(searchTerms)]; // De-dupe terms
  var dataList = $("#datalist-searchterms");
  for (var i = 0; i < searchTerms.length; i++) {
    $(
      "<option class='user-name-style' value='" +
        escapeHtml(searchTerms[i]) +
        "'>"
    ).appendTo(dataList);
  }

  var currentTime = new Date().getTime();
  if (currentTime > 1668920400000 && currentTime < 1669525200000) {
    $("body").addClass("hate-week-style");
  }

  $("#loading-alert").hide();
});

function lookupUserRank(uid, top) {
  for (var i = 0; i < top.length; i++) {
    if (top[i].id == uid) {
      return i + 1;
    }
  }
  return -1;
}

var dateOptions = {
  day: "numeric",
  month: "numeric",
  year: "2-digit",
  hour: "numeric",
  minute: "2-digit",
};

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

function lookupUserName(uid, users) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === uid) {
      return escapeHtml(users[i].name);
    }
  }
  return "(unknown user)*";
}

function lookupUserRealName(uid, users) {
  console.log(uid);
  console.log(users);
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === uid) {
      return escapeHtml(users[i].realName);
    }
  }
  return "(unknown user)";
}

function colorIfMatch(input, search, color) {
  if (input === search) {
    return "<span class='" + color + "'>" + input + "</span>";
  } else {
    return input;
  }
}

function showUserModal(usernameSearch, data) {
  var searchModal = $("#search-modal");
  var usernameDOM = $("#search-modal-username");
  var rankDOM = $("#search-modal-rank");
  var snipesDOM = $("#search-modal-snipes");
  var snipedDOM = $("#search-modal-sniped");
  if (usernameSearch === "") return;
  var matches = [];
  var users = Object.values(data.users);
  // Let's look for exact and partial matches (exact matches are preferred so put them at the front)
  // TODO: maybe let the user choose from a list when mutltiple partial matches are found without an exact match?
  for (var i = 0; i < users.length; i++) {
    var usr = users[i];
    if (usr.name === usernameSearch) {
      matches.unshift(usr);
    } else if (usr.name.includes(usernameSearch)) {
      matches.push(usr);
    }
  }
  if (matches.length == 0) {
    // Try again but for their real name
    for (var i = 0; i < users.length; i++) {
      var usr = users[i];
      if (usr.realName === usernameSearch) {
        matches.unshift(usr);
      } else if (usr.realName.includes(usernameSearch)) {
        matches.push(usr);
      }
    }
    if (matches.length == 0) {
      alert("User not found!");
      return;
    }
  }

  var usr = matches[0];
  var myUsrName = escapeHtml(usr.name);
  var realName = escapeHtml(lookupUserRealName(usr.id, users));
  if (myUsrName !== realName) {
    usernameDOM.html(
      myUsrName +
        " <span class='user-name-style text-muted'>(" +
        realName +
        ")</span>"
    );
  } else {
    usernameDOM.html(myUsrName);
  }
  usernameDOM.attr(
    "title",
    myUsrName +
      " (" +
      realName +
      ") (ID: " +
      parseInt(usr.id).toString(36) +
      ")"
  );
  var rank = lookupUserRank(usr.id, data.leaderboard.top);
  if (rank > 0) {
    if (rank <= 5) {
      rankDOM.html(
        rank + " <i style='color: gold;' class='bi bi-award-fill'></i>"
      );
    } else {
      rankDOM.html(rank);
    }
  } else {
    rankDOM.html("No Ranking");
  }
  var rankSnipes = lookupUserRank(usr.id, data.leaderboard.snipers);
  var rankSniped = lookupUserRank(usr.id, data.leaderboard.sniped);
  if (rankSnipes <= 5 && rankSnipes > 0) {
    snipesDOM.html(
      usr.snipes + " <i style='color: gold;' class='bi bi-award-fill'></i>"
    );
  } else {
    snipesDOM.html(usr.snipes);
  }
  if (rankSniped <= 5 && rankSniped > 0) {
    snipedDOM.html(
      usr.sniped + " <i style='color: gold;' class='bi bi-award-fill'></i>"
    );
  } else {
    snipedDOM.html(usr.sniped);
  }
  var usrSnipes = [];
  var allSnipes = data.snipes;
  for (var i = 0; i < allSnipes.length; i++) {
    var s = allSnipes[i];
    if (s.sniper === usr.id || s.snipee.includes(usr.id)) {
      usrSnipes.push(s);
    }
  }
  if (usrSnipes.length == 0) {
    $("#search-modal-logtable").hide();
    $("#search-modal-unknown-user").hide();
  } else {
    $("#search-modal-logtable").show();
    var body = $("#search-modal-logtable-body");
    body.html("");
    var hasUnknown = false;
    for (var i = 0; i < usrSnipes.length; i++) {
      var s = usrSnipes[i];
      var date = new Date(0);
      date.setUTCSeconds(s.date / 1000);
      var snipees = [];
      var rawSnipees = [];
      for (var j = 0; j < s.snipee.length; j++) {
        snipees.push(
          colorIfMatch(
            lookupUserName(s.snipee[j], users),
            myUsrName,
            "text-primary"
          )
        );
        rawSnipees.push(lookupUserName(s.snipee[j], users));
      }
      var sniper = colorIfMatch(
        lookupUserName(s.sniper, users),
        myUsrName,
        "text-primary"
      );
      var rawSniper = lookupUserName(s.sniper, users);
      if (snipees.includes("(unknown user)*") || sniper === "(unknown user)*") {
        hasUnknown = true;
      }
      $(
        "<tr class='user-name-style' title='" +
          rawSniper +
          " sniped " +
          rawSnipees.join(", ") +
          " (ID: " +
          parseInt(s.id).toString(36) +
          ")'><th scope='row' class='align-middle text-nowrap'>" +
          date.toLocaleString(undefined, dateOptions) +
          "</th><td class='align-middle'>" +
          sniper +
          "</td><td class='align-middle'>" +
          snipees.join(", ") +
          "</td></tr>"
      ).appendTo(body);
    }
    if (hasUnknown) {
      $("#search-modal-unknown-user").show();
    } else {
      $("#search-modal-unknown-user").hide();
    }
  }
  searchModal.modal("show");
}
