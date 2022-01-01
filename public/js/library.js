"use strict";
var socket = io();
var settings = [];

$(document).ready(function() {
  showPage();
});

function showPage() {
  // Read settings from cookie
  settings.zoneID = readCookie("settings['zoneID']");
  settings.displayName = readCookie("settings['displayName']");

  // Set page fields to settings
  if (settings.zoneID === null) {
    $("#overlayZoneList").show();
  }

  if (settings.displayName !== null) {
    $(".buttonZoneName").html(settings.displayName);
    if (settings.zoneID !== null) {
      goHome();
    }
  }

  enableSockets();
}

function enableSockets() {
  socket.on("zoneList", function(payload) {
    $(".zoneList").html("");

    if (payload !== undefined) {
      for (var x in payload) {
        $(".zoneList").append(
          '<button type="button" class="buttonOverlay buttonZoneId" id="button-' +
            payload[x].zone_id +
            '" onclick="selectZone(\'' +
            payload[x].zone_id +
            "', '" +
            payload[x].display_name +
            "')\">" +
            payload[x].display_name +
            "</button>"
        );
      }
      // Set zone button to active
      $(".buttonZoneId").removeClass("buttonSettingActive");
      $("#button-" + settings.zoneID).addClass("buttonSettingActive");
    }
  });
}

function selectZone(zone_id, display_name) {
  settings.zoneID = zone_id;
  settings.displayName = display_name;
  $(".buttonZoneName").html(settings.displayName);

  // Set zone button to active
  $(".buttonZoneId").removeClass("buttonSettingActive");
  $("#button-" + settings.zoneID).addClass("buttonSettingActive");
  $("#overlayZoneList").hide();
  goHome(settings.zoneID);
}

function goBack() {
  var data = {};
  data.zone_id = settings.zoneID;
  data.options = { pop_levels: 1 };

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goRefreshBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID, 1);
    }
  });
}

function goHome() {
  var data = {};
  data.zone_id = settings.zoneID;
  data.options = { pop_all: true };

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goRefreshBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID);
    }
  });
}

function goRefresh() {
  var data = {};
  data.zone_id = settings.zoneID;
  data.options = { refresh_list: true };

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goRefreshBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID);
    }
  });
}

function goList(item_key, listoffset) {
  var data = {};
  data.zone_id = settings.zoneID;
  data.options = { item_key: item_key };

  if (listoffset === undefined) {
    data.listoffset = 0;
  } else {
    data.listoffset = listoffset;
  }

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goRefreshBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID);
    }
  });
}

function goPage(listoffset) {
  var data = {};
  if (listoffset === undefined) {
    data.listoffset = 0;
  } else {
    data.listoffset = listoffset;
  }

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goLoadBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID);
    }
  });
}

function goSearch() {
  var data = {};
  data.zone_id = settings.zoneID;
  data.options = {};
  if ($("#searchText").val() === "" || $("#searchItemKey").val() === "") {
    return;
  } else {
    data.options.item_key = $("#searchItemKey").val();
    data.options.input = $("#searchText").val();
  }

  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    url: "/roonapi/goRefreshBrowse",
    success: function(payload) {
      showData(payload, settings.zoneID);
    }
  });
}

function showData(payload, zone_id) {
  $("#buttonRefresh")
    .html(getSVG("refresh"))
    .attr("onclick", "goRefresh()");

  var items = payload.data.items;
  var list = payload.data.list;

  $("#items").html("");

  if (items !== null) {
    $("#listTitle").html(list.title);
    $("#listSubtitle").html(list.subtitle);

    if (list.image_key) {
      $("#listImage")
        .html(
          '<img class="listInfoImage" src="/roonapi/getImage?image_key=' +
            list.image_key +
            '" alt="">'
        )
        .show();
      $("#coverBackground")
        .css(
          "background-image",
          'url("/roonapi/getImage?image_key=' + list.image_key + '")'
        )
        .show();
    } else {
      $("#listImage")
        .html("")
        .hide();
      $("#coverBackground").hide();
    }

    for (var x in items) {
      var html = "";
      if (items[x].input_prompt) {
        html += '<form action="javascript:goSearch();" class="searchGroup">';
        html +=
          '<input type="search" id="searchText" name="search" class="searchForm" placeholder="' +
          items[x].input_prompt.prompt +
          '" autocomplete="off">';
        html +=
          '<button type="submit" class="itemListButton">' +
          getSVG("search") +
          "</button>";
        html +=
          '<input type="text" id="searchItemKey" class="hidden" value="' +
          items[x].item_key +
          '" ></span>';
        html += "</form>";

        $("#items").append(html);
      } else {
        html +=
          '<button type="button" class="itemListItem" onclick="goList(\'' +
          items[x].item_key +
          "')\">";
        html += items[x].title;
        if (items[x].subtitle === null || items[x].subtitle == "") {
        } else {
          html +=
            '<br><span class="textSmall">(' + items[x].subtitle + ")</span>";
        }
        html += "</button>";
        html += "</form>";

        $("#items").append(html);
      }
    }

    if (list.level == 0) {
      $("#buttonBack")
        .prop("disabled", true)
        .attr("aria-disabled", true)
        .html(getSVG("back"));
      $("#buttonHome")
        .prop("disabled", true)
        .attr("aria-disabled", true)
        .html(getSVG("home"));
    } else {
      $("#buttonBack")
        .attr("onclick", "goBack()")
        .attr("aria-disabled", false)
        .html(getSVG("back"))
        .prop("disabled", false);
      $("#buttonHome")
        .attr("onclick", "goHome()")
        .attr("aria-disabled", false)
        .html(getSVG("home"))
        .prop("disabled", false);
    }

    if (list.display_offset > 0) {
      $("#buttonPrev")
        .prop("disabled", false)
        .attr("onclick", "goPage('" + (list.display_offset - 100) + "')")
        .attr("aria-disabled", false)
        .html(getSVG("prev"));
    } else {
      $("#buttonPrev")
        .prop("disabled", true)
        .attr("aria-disabled", true)
        .html(getSVG("prev"));
    }

    if (list.display_offset + items.length < list.count) {
      $("#buttonNext")
        .prop("disabled", false)
        .attr("aria-disabled", false)
        .attr("onclick", "goPage('" + (list.display_offset + 100) + "')")
        .html(getSVG("next"));
    } else {
      $("#buttonNext")
        .prop("disabled", true)
        .attr("aria-disabled", true)
        .html(getSVG("next"));
    }

    $("#pageNumber").html(
      list.display_offset +
        1 +
        "-" +
        (list.display_offset + items.length) +
        " of " +
        list.count
    );

    if (
      $("#buttonPrev").prop("disabled") === true &&
      $("#buttonNext").prop("disabled") === true
    ) {
      $("#navLine2").hide();
      $("#content").css("bottom", "0");
    } else {
      $("#navLine2").show();
      $("#content").css("bottom", "48px");
    }
  }
}

function readCookie(name) {
  return Cookies.get(name);
}

function getSVG(cmd) {
  switch (cmd) {
    case "home":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/></svg>';
    case "back":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>';
    case "refresh":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71l-.64.65z"/></svg>';
    case "prev":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M16.62 2.99a1.25 1.25 0 0 0-1.77 0L6.54 11.3a.996.996 0 0 0 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z"/></svg>';
    case "next":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31a.996.996 0 0 0 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"/></svg>';
    case "backspace":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M22 3H7c-.69 0-1.23.35-1.59.88L.37 11.45c-.22.34-.22.77 0 1.11l5.04 7.56c.36.52.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.7 13.3a.996.996 0 0 1-1.41 0L14 13.41l-2.89 2.89a.996.996 0 1 1-1.41-1.41L12.59 12 9.7 9.11a.996.996 0 1 1 1.41-1.41L14 10.59l2.89-2.89a.996.996 0 1 1 1.41 1.41L15.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z"/></svg>';
    case "search":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
    case "music":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5v8.55c-.94-.54-2.1-.75-3.33-.32-1.34.48-2.37 1.67-2.61 3.07a4.007 4.007 0 0 0 4.59 4.65c1.96-.31 3.35-2.11 3.35-4.1V7h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2c-1.1 0-2 .9-2 2z"/></svg>';
    default:
      break;
  }
}
