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

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  var slider = $('#hood_type').val();
  var travelMode = $('input[name=mode]:checked').val();;
  var home = $("#homeAddress").val();
  var work = $("#workAddress").val();
  
  var homeLoc;
  var homeMark;

  var getDirections = function() {
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
          alert(response.routes[0].legs[0].duration.text);
        }
      });
    } else {
      homeMark = new google.maps.Marker({
        position: homeLoc,
        map: map
      });
      map.setCenter(homeLoc);
      map.setZoom(12);
    }
  }

  var locationHandler = function(response, status) {
    homeLoc = response[0].geometry.location;
    var placeRequest = {
      keyword: "nightlife",
      location: homeLoc,
      radius: 1000
    }
    placeService.radarSearch(placeRequest, function(response, status) {
      alert(response.length);
    });
    getDirections();
  }

  geocoder.geocode({address: home}, locationHandler);

});

var timeToWork = {
  time: 4,
  weight: 1
}

var distToObj = {
  dist: 4,
  weight: 1
}

var objWithinRadius = {
  total: 0,
  weight: 1
}

function locationScore(list) {

  totSum = 0;
  totWeight = 0;
  for(obj in list){

    if(obj.type() == timeToWork) {
      //logistic function
      normVal = 1 - 1/(1+exp(-1(timeToWork.time-(60*60)))); //60*60 is 50% mark
    } else if (obf.type() == distToObj) {
      //logistic function
      normVal = 1 - 1/(1+exp(-1(distToObj.dist-(100)))); //100 is midpoint distance
    } else {// of type objWithinRadius
      //logistic function
      normVal = 1 - 1/(1+exp(-1(objWithinRadius.dist-(3)))); //3 is midpoint number wanted
    }

    totSum += normVal;
    totWeight += obj.weight;
  }

  locationScore = totSum/totWeight * 10;

}
