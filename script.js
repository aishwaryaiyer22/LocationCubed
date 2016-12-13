var homeAutocomplete = new google.maps.places.Autocomplete(document.getElementById('homeAddress'), {
  types: ['address'],
});

var workAutocomplete = new google.maps.places.Autocomplete(document.getElementById('workAddress'), {
  types: ['address'],
});

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

var slider;
var travelMode;
var home;
var work;

var homeLoc;
var homeMark;

var components = [];

function calcDistance(p1, p2) {
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2)).toFixed(2);
}

function scoreTime(seconds) {
  return 1 - 1/(1 + Math.exp((60 * 60) - seconds)); //60*60 is 50% mark
}

function scoreDistance(meters) {
  return 1 - 1/(1 + Math.exp(100 - meters)); //100 is midpoint distance
}

function scoreNearby(quantity) {
  return 1 - 1/(1 + Math.exp(3 - quantity)); //3 is midpoint quantity wanted
}

function locationScore(list) {
  var totSum = 0;
  var totWeight = 0;
  for(var i = 0; i < list.length; i++){
    var obj = list[i];
    console.log(obj);
    var normVal;
    if (obj.type == "time") {
      normVal = scoreTime(obj.value);
    } else if (obj.type == "distance") {
      normVal = scoreDistance(obj.value);
    } else if (obj.type == "nearby") {
      normVal = scoreNearby(obj.value);
    }

    totSum += normVal;
    totWeight += obj.weight;
  }

  return 10 * totSum/totWeight;
}

function getDirections() {
  if(homeMark) {
    homeMark.setMap(null);
  }
  if(work != "") {
    var dirRequest = {
      origin: homeLoc,
      destination: work,
      travelMode: travelMode
    }
    dirService.route(dirRequest, function(response, status) {
      if(status == 'OK') {
        dirDisplay.setDirections(response);
        components.push({
          type: "time",
          value: response.routes[0].legs[0].duration.value,
          weight: 1
        });
      }
    });
  } else {
    dirDisplay.setDirections({routes: []});
    homeMark = new google.maps.Marker({
      position: homeLoc,
      map: map
    });
  }
  alert(locationScore(components));
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

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  slider = $('#hood_type').val();
  travelMode = $('input[name=mode]:checked').val();;
  home = $("#homeAddress").val();
  work = $("#workAddress").val();

  geocoder.geocode({address: home}, locationHandler);
});
