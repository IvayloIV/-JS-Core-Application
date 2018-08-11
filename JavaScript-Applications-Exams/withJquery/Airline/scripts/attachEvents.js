function attachAllEvents() {
    // Bind the navigation menu links
    $(".left-container ul li:nth-of-type(4)").on('click', showRegisterView);
    $(".left-container ul li:nth-of-type(3)").on('click', showLoginView);
    $(".left-container ul li:nth-of-type(1)").on('click', catalog);
    $(".left-container ul li:nth-of-type(2)").on('click', myFlight);
    $('.right-container a').on('click', logoutUser);

    // Bind the form submit buttons
    $("#formLogin").on('submit', loginUser);
    $("#formRegister").on('submit', registerUser);
    $("#viewCatalog .add-flight").on('click', showCreateFlight);
    $("#formAddFlight").on('submit', createFlight);
    $("#formEditFlight").on('submit', editFlight);
    $("form").on('submit', function(event) { event.preventDefault() });

    // Bind the info / error boxes
    $("#infoBox, #errorBox").on('click', function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show(); },
        ajaxStop: function() { $("#loadingBox").hide(); }
    })
}