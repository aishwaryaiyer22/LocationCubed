var score_breakdown;

//can make api calls using these values
var placeService;
var geocoder = new google.maps.Geocoder;
var dirService = new google.maps.DirectionsService();
var dirDisplay = new google.maps.DirectionsRenderer();
var map, map2;

var home;
var work;
var mode;
var slider;
var kids;

var homeLoc;
var homeMark;

var components = [];
var score;

//Show range value as it is changed
function showValue(newValue)
{
	document.getElementById("hood_type").innerHTML=newValue;
}

function displayResults()
{
	document.getElementById("score").innerHTML= "<h3>Overall Score: "+ score+"</h3>";
	var temp_text = "<br><p><u><b>Breakdown:</p>";
	var deets = document.getElementById("score_details");
	var work_header = document.getElementById("work-header");
	var location_header = document.getElementById("location-header");
	console.log(score_breakdown);
	deets.innerHTML= temp_text;
	deets.style.display = "";

	mapOptions = {
			zoom: 4,
			center: {lat: 40.0, lng: -95.0}
	};
	work_header.innerHTML = "<br><u><p><b>Route to Work:</p><br>";
	location_header.innerHTML = "<br><u><p><b>Neighborhood:</p><br>"
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    map2 = new google.maps.Map(document.getElementById('map2'), mapOptions);
	placeService = new google.maps.places.PlacesService(map);
	dirDisplay.setMap(map);
	dirDisplay.setMap(map2);
}

$(window).on('resize', function() {
    $windowWidth = $(this).width();
 	console.log("resize detected")
    console.log($windowWidth);
});


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
    score_breakdown = obj;
    console.log(list[i]);
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
    console.log(normVal);
    totSum += normVal*obj.weight;
    totWeight += obj.weight;
  }
  score =  10 * totSum/totWeight;
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
        var mapOptions = {
			zoom: 4,
			center: {lat: 40.0, lng: -95.0}
		};
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);
		dirDisplay.setMap(map);
      }
      console.log("Score: " + locationScore(components));
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
	localStorage.home 	= document.getElementById("inputAddress").value
	localStorage.slider	= document.getElementById("hood_type").value
	localStorage.work	= document.getElementById("workAddress").value
	localStorage.mode	= document.getElementById("transport1").checked? "DRIVING":"TRANSIT"
	localStorage.kids	= document.getElementById("child_yes").checked? true:false
	displayResults()
	event.preventDefault();
	slider	= document.getElementById("hood_type").value;
	mode 	= document.getElementById("transport1").checked? "DRIVING":"TRANSIT";
	home 	= document.getElementById("inputAddress").value;
	work 	= $("#workAddress").val();
	kids 	= document.getElementById("child_yes").checked? true:false

  components = [];
  geocoder.geocode({address: home}, locationHandler);
});

