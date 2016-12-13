var homeAutocomplete = new google.maps.places.Autocomplete(document.getElementById('homeAddress'));

var workAutocomplete = new google.maps.places.Autocomplete(document.getElementById('workAddress'));

var mapOptions = {
  zoom: 4,
  center: {lat: 40.0, lng: -95.0}
}

var map = new google.maps.Map(document.getElementById('map'), mapOptions);
var placeService = new google.maps.places.PlacesService(map);
var geocoder = new google.maps.Geocoder;
var dirService = new google.maps.DirectionsService();
var dirDisplay = new google.maps.DirectionsRenderer();
dirDisplay.setMap(map);

var home;
var work;
var mode;
var slider;
var kids;

var homeLoc;
var homeMark;

var components = [];

function calcDistance(p1, p2) {
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2)).toFixed(2);
}

function scoreTime(seconds) {
  var midpoint = 35*60;
  var k = 0.001;
  return 1/(1 + Math.exp(-k*(midpoint-seconds)));
}

function scoreDistance(meters) {
  var midpoint = 500;
  var k = 0.01;
  return 1/(1 + Math.exp(-k*(midpoint-meters)));
}

function scoreNearby(quantity) {
  var midpoint = 5;
  var k = 0.5;
  return 1 - 1/(1 + Math.exp(-k*(midpoint-quantity)));
}

function locationScore(list) {
  var totSum = 0;
  var totWeight = 0;
  for(var i = 0; i < list.length; i++){
    var obj = list[i];
    var normVal;
    if (obj.type == "time") {
      if(obj.value > 3*60*60) {
        return 0;
      }
      normVal = scoreTime(obj.value);
    } else if (obj.type == "distance") {
      normVal = scoreDistance(obj.value);
    } else if (obj.type == "nearby") {
      normVal = scoreNearby(obj.value);
    }
    totSum += normVal*obj.weight;
    totWeight += obj.weight;
  }

  return 10 * totSum/totWeight;
}

function getDirections() {
  if(homeMark) {
    homeMark.setMap(null);
  }
    var dirRequest = {
      origin: homeLoc,
      destination: work,
      travelMode: mode
    }
    dirService.route(dirRequest, function(response, status) {
      if(status == 'OK') {
        dirDisplay.setDirections(response);
        components.push({
          type: "time",
          value: response.routes[0].legs[0].duration.value,
          weight: 2
        });
      } else {
        dirDisplay.setDirections({routes: []});
        homeMark = new google.maps.Marker({
          position: homeLoc,
          map: map
        });
      }
      $("#score").prepend(("<h3>Overall score: " + locationScore(components) + "</h3>"));
    });
}

function locationHandler(response, status) {
  homeLoc = response[0].geometry.location;
  map.setCenter(homeLoc);
  map.setZoom(12);
  var nightlifeRequest = {
    keyword: "nightlife",
    location: homeLoc,
    radius: 1000
  }
  placeService.radarSearch(nightlifeRequest, function(response, status) {
    components.push({
      type: "nearby",
      value: response.length,
      weight: 1
    });
    var groceryRequest = {
      keyword: "grocery store",
      location: homeLoc,
      rankBy: google.maps.places.RankBy.DISTANCE
    }
    placeService.nearbySearch(groceryRequest, function(response, status) {
      components.push({
        type: "distance",
        value: calcDistance(homeLoc, response[0].geometry.location),
        weight: 1
      });
      getDirections();
    });
  });
} 

function loadPrevious() {
  $("#homeAddress").val(localStorage.getItem("home"));
  $("#workAddress").val(localStorage.getItem("work"));
  $('#hood_type').val(localStorage.getItem("slider"));
  $('input[name=mode][value=' + localStorage.getItem("mode") + ']').prop("checked", true);
  $('input[name=kids][value=' + localStorage.getItem("kids") + ']').prop("checked", true);
}

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  slider = $('#hood_type').val();
  mode = $('input[name=mode]:checked').val();;
  kids = $('input[name=kids]:checked').val();;
  home = $("#homeAddress").val();
  work = $("#workAddress").val();

  localStorage.setItem("home", home);
  localStorage.setItem("work", work);
  localStorage.setItem("mode", mode);
  localStorage.setItem("kids", kids);
  localStorage.setItem("slider", slider);

  components = [];

  geocoder.geocode({address: home}, locationHandler);
});
