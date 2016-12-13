sessionStorage.setItem("destination","")
sessionStorage.workAddress = ""
sessionStorage.transit_type = ""
sessionStorage.child = false
sessionStorage.hood_score_lively, sessionStorage.hood_score_quiet = 50  

//can make api calls using these values

var placeService;
var geocoder = new google.maps.Geocoder;
var dirService = new google.maps.DirectionsService();
var dirDisplay = new google.maps.DirectionsRenderer();
var map;

var slider;
var travelMode;
var home;
var work;

var homeLoc;
var homeMark;

var components = [];
var score;

//Show range value as it is changed
function showValue(newValue)
{
	document.getElementById("hood_type").innerHTML=newValue;
}

//Log input for debugging
function logInput()
{
	console.log(sessionStorage.getItem("destination"))
	console.log(sessionStorage.hood_score_lively)
	console.log(sessionStorage.hood_score_quiet)
	console.log(sessionStorage.workAddress)
	console.log(sessionStorage.transit_type)
	console.log(sessionStorage.child)
}

function displayResults()
{
	var score;
	document.getElementById("score").innerHTML= "<h3>Overall Score: "+ score+"</h3>";
	var temp_text = "<br><p style =><b>Breakdown:</p><hr class = light>";
	var deets = document.getElementById("score_details");
	deets.innerHTML= temp_text;
	deets.style.display = "";
	mapOptions = {
			zoom: 4,
			center: {lat: 40.0, lng: -95.0}
	};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    placeService = new google.maps.places.PlacesService(map);
	dirDisplay.setMap(map);

}

$(window).on('resize', function() {
    $windowWidth = $(this).width();
 	console.log("resize detected")
    console.log($windowWidth);
});


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
  score =  10 * totSum/totWeight;
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
        var mapOptions = {
			zoom: 4,
			center: {lat: 40.0, lng: -95.0}
		};
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);
		dirDisplay.setMap(map);
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
  var placeRequest = {
    keyword: "nightlife",
    location: homeLoc,
    radius: 1000
  }
  placeService.radarSearch(placeRequest, function(response, status) {
    components.push({
      type: "nearby",
      value: response.length,
      weight: 1
    });
    getDirections();
  });
}

$("#user-info-form").submit(function(event) {
	sessionStorage.destination			= document.getElementById("inputAddress").value
	sessionStorage.hood_score_lively	= document.getElementById("hood_type").value
	sessionStorage.workAddress			= document.getElementById("workAddress").value
	sessionStorage.transit_type		= document.getElementById("transport1").checked? "DRIVING":"TRANSIT"
	sessionStorage.child				= document.getElementById("child_yes").checked? true:false
	sessionStorage.hood_score_quiet	= 100 - sessionStorage.hood_score_lively
	logInput()
	displayResults()
	event.preventDefault();
	slider = document.getElementById("hood_type").value;
	travelMode = document.getElementById("transport1").checked? "DRIVING":"TRANSIT";
	home = document.getElementById("inputAddress").value;
	work = $("#workAddress").val();

	geocoder.geocode({address: sessionStorage.destination}, locationHandler);
});

