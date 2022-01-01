"use strict";
var socket = io();

$(document).ready(function() {
  $("#buttonMenu").html(getSVG("menu"));

  socket.on("pairStatus", function(payload) {
    var pairEnabled = payload.pairEnabled;

    if (pairEnabled === true) {
      showSection("nowPlaying");
    } else {
      showSection("pairDisabled");
    }
  });
});

function showSection(sectionName) {
  switch (sectionName) {
    case "nowPlaying":
      $("#buttonMenu").show();
      // Show Now Playing screen
      $("#nowPlaying").show();
      // Hide inactive sections
      $("#pairDisabled").hide();
      $("#libraryBrowser").hide();
      $("#overlayMainMenu").hide();
      break;
    case "libraryBrowser":
      $("#buttonMenu").show();
      // Show libraryBrowser
      $("#libraryBrowser").show();
      // Hide inactive sections
      $("#pairDisabled").hide();
      $("#nowPlaying").hide();
      $("#overlayMainMenu").hide();
      break;
    case "pairDisabled":
      // Show pairDisabled section
      $("#pairDisabled").show();
      // Hide everthing else
      $("#buttonMenu").hide();
      $("#libraryBrowser").hide();
      $("#nowPlaying").hide();
      $("#pageLoading").hide();
      break;
    default:
      break;
  }
  var t = setTimeout(function() {
    $("#pageLoading").hide();
  }, 250);
}

function getSVG(cmd) {
  switch (cmd) {
    case "menu":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>';
    default:
      break;
  }
}
