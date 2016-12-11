var key = "AIzaSyAzKcjLpeaBQ3G-Fb0r8X318XVDSI9kbhQ"

$("#user-info-form").submit(function(event) {
  event.preventDefault();
  var mode = $('input[name=mode]:checked').val();;
  var origin = $("#homeAddress").val();
  var destination = $("#workAddress").val();

  var request = $.get($(this).attr("action"), {
    key: key,
    mode: mode,
    origin: origin,
    destination: destination
  });

  request.done(function(data) {
    alert(data["routes"][0]["legs"][0]["duration"]["text"]);
  });

  request.fail(function(data) {
    alert("Request failed");
  });
});
