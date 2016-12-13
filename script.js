homeAutocomplete = new google.maps.places.Autocomplete(document.getElementById('homeAddress'), {
  types: ['address'],
});
workAutocomplete = new google.maps.places.Autocomplete(document.getElementById('workAddress'), {
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

  geocoder.geocode({address: home}, function(response, status) {
    var homeLoc = response[0].geometry.location;
    var placeRequest = {
      keyword: "nightlife",
      location: homeLoc,
      radius: 1000
    }
    placeService.radarSearch(placeRequest, function(response, status) {
      alert(response.length);
    });
  });

  if(work != "") {
    var dirRequest = {
      origin: home,
      destination: work,
      travelMode: travelMode
    }
    dirService.route(dirRequest, function(response, status) {
      if (status == 'OK') {
        dirDisplay.setDirections(response);
        alert(response.routes[0].legs[0].duration.text);
      }
    });
  }
});
