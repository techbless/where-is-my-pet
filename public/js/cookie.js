var setCookie = function(name, value, exp) {
  var date = new Date();
  date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
  document.cookie =
    name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
};
var getCookie = function(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? value[2] : null;
};

$(document).ready(function() {
  const agree = getCookie("agree");
  if (agree != "true") {
    $("#howtouse").modal({ backdrop: "static", keyboard: false });
  }
});

function agree() {
  //alert('clicked')
  const checkbox = $("#agree-cb").is(":checked");
  if (checkbox == true) {
    setCookie("agree", "true", 7);
    alert("실종하거나 발견한 위치를 지도에서 클릭해주세요.");
    $("#howtouse").modal("hide");
  } else {
    alert("서비스를 이용하려면 모두 읽고 이해 후 체크해주세요.");
  }
}
