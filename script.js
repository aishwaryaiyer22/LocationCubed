var mapOptions = {
  zoom: 4,
  center: {lat: 40.0, lng: -95.0}
}

var map = new google.maps.Map(document.getElementById('map'), mapOptions);
var dirService = new google.maps.DirectionsService();
var dirDisplay = new google.maps.DirectionsRenderer();
dirDisplay.setMap(map);

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  var travelMode = $('input[name=mode]:checked').val();;
  var origin = $("#homeAddress").val();
  var destination = $("#workAddress").val();

  var request = {
    origin: origin,
    destination: destination,
    travelMode: travelMode,
  }
  dirService.route(request, function(response, status) {
    if (status == 'OK') {
      dirDisplay.setDirections(response);
      alert(response.routes[0].legs[0].duration.text);
    }
  });
});
