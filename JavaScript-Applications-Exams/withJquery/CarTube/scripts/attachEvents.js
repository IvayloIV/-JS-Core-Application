function attachAllEvents() {
    // Bind the navigation menu links
    $('#container nav > a:first-of-type').on('click', showHomeView);
    $('#container #profile > a:last-child').on('click', logoutUser);
    $('#container nav > a:nth-of-type(2)').on('click', showCars);
    $('#container nav > a:nth-of-type(3)').on('click', myCars);
    $('#container nav > a:nth-of-type(4)').on('click', showCreateView);

    // Bind the form submit buttons
    $("#login form").on('submit', loginUser);
    $("#register form").on('submit', registerUser);
    $("#create-listing form").on('submit', createCar);
    $("#edit-listing form").on('submit', editCar);
    $("#main #button-div a:nth-of-type(1)").on('click', showLoginView);
    $("#main #button-div a:nth-of-type(2)").on('click', showRegisterView);
    $("#login .container.signin a").on('click', showRegisterView);
    $("#register .container.signin a").on('click', showLoginView);
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