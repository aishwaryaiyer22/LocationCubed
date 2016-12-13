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
  midpoint=60*60;
  k=0.001;
  return 1/(1 + Math.exp(-k*(midpiont-seconds));
}

function scoreDistance(meters) {
  midpoint=500;
  k=0.01;
  return 1/(1 + Math.exp(-k*(midpoint-meters));
}

function scoreNearby(quantity) {
  midpoint=5;
  k=0.5;
  return 1 - 1/(1 + Math.exp(-k*(midpoint-quantity)));
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

    totSum += normVal*obj.weight;
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
