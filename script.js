sessionStorage.setItem("destination","")
sessionStorage.workAddress = ""
sessionStorage.transit_type = ""
sessionStorage.child = false
sessionStorage.hood_score_lively, sessionStorage.hood_score_quiet = 50  


//Collect all form values
function submit()
{
	sessionStorage.destination			= document.getElementById("inputAddress").value
	sessionStorage.hood_score_lively	= document.getElementById("hood_type").value
	sessionStorage.workAddress			= document.getElementById("workAddress").value
	sessionStorage.transit_type		= document.getElementById("transport1").checked? "car":"public"
	sessionStorage.child				= document.getElementById("child_yes").checked? true:false
	sessionStorage.hood_score_quiet	= 100 - sessionStorage.hood_score_lively
	logInput()
	displayResults()
}

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
	document.getElementById("score").innerHTML= "<h3>Overall Score: 10</h3>"
	var temp_text = "<br><p style =><b>Breakdown:</p><hr class = light>" 
	var deets = document.getElementById("score_details")
	deets.innerHTML= temp_text
	deets.style.display = ""

}

$(window).on('resize', function() {
    $windowWidth = $(this).width();
 	console.log("resize detected")
    console.log($windowWidth);
});

//can make api calls using these values
