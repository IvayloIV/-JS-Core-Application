function attachAllEvents() {
    // Bind the navigation menu links
    $("#nav ul li:last-child a").on('click', logoutUser);
    $("#nav ul li:first-child a").on('click', viewHome);
    $("#nav ul li:nth-of-type(2) a").on('click', allReceipts);

    // Bind the form submit buttons
    $("#login-form").on('submit', loginUser);
    $("#register-form").on('submit', registerUser);
    $("#create-entry-form").on('submit', createEntry);
    $("#create-receipt-form").on('submit', checkOut);
    $("form").on('submit', function(event) { event.preventDefault() })

    // Bind the info / error boxes
    $("#infoBox, #errorBox").on('click', function() {
        $(this).fadeOut()
    })

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    })
}