var key = "AIzaSyAzKcjLpeaBQ3G-Fb0r8X318XVDSI9kbhQ"

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  var mode = "transit";
  var origin = $("#homeAddress").val();
  var destination = $("#workAddress").val();
  var request = $.get($(this).attr("action"), {mode: mode, origin: origin, destination: destination, key: key});
  request.done(function(data) {
    alert(data);
    alert(data["routes"][0]["legs"][0]["duration"]["text"]);
  });
});

