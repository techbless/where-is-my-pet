$(function() {
    $('#datetimepicker1').datetimepicker({locale: 'ko', format: 'YYYY-MM-DD HH:mm', ignoreReadonly: true});
});

$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop()
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName)
})