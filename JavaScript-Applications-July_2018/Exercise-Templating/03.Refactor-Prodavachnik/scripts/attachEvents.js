function attachAllEvents() {
    // Bind the info / error boxes
    $("#infoBox, #errorBox").on('click', function() {
        $(this).css('display', 'none');
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    })
}