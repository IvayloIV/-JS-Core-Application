$(document).on({
    ajaxStart: function () {
        $('#loadingBox').show();
    },
    ajaxStop: function () {
        $('#loadingBox').hide();
    }
});

function acceptBox(message) {
    $('#accept').text(message).show();
    setTimeout(function () {
        $('#accept').fadeOut();
    }, 3000);
}

function errorBox(message) {
    $('#error').text(message).show();
    setTimeout(function () {
        $('#error').fadeOut();
    }, 3000);
}