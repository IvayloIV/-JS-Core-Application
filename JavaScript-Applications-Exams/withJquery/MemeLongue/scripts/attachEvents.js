function attachAllEvents() {
    // Bind the navigation menu links
    $('#container nav > a:first-of-type').on('click', showHomeView);
    $('#profile a:last-of-type').on('click', logoutUser);
    $('#container nav > a:nth-of-type(2)').on('click', showCreateView);
    $('#profile a:nth-of-type(2)').on('click', function () {
        profile(sessionStorage.getItem('username'));
    });

    // Bind the form submit buttons
    $('#login > form').on('submit', loginUser);
    $('#register > form').on('submit', registerUser);
    $('#create-meme > form').on('submit', createMeme);
    $('#edit-meme > form').on('submit', editMeme);
    $('#button-div a:first-of-type').on('click', showLoginView);
    $('#button-div a:last-of-type').on('click', showRegisterView);
    $('#login  .container.signin a').on('click', showRegisterView);
    $('#register .container.signin a').on('click', showLoginView);
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