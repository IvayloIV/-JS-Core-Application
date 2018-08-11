function attachAllEvents() {
    // Bind the navigation menu links
    $("#linkMenuAppHome").on('click', showHomeView);
    $("#linkMenuLogin").on('click', showLoginView);
    $("#linkMenuRegister").on('click', showRegisterView);
    $("#linkMenuUserHome").on('click', showUserHome);
    $("#linkMenuLogout").on('click', logoutUser);
    $("#linkUserHomeMyMessages").on('click', myMessages);
    $("#linkMenuMyMessages").on('click', myMessages);
    $("#linkUserHomeArchiveSent").on('click', sentArchive);
    $("#linkMenuArchiveSent").on('click', sentArchive);
    $("#linkUserHomeSendMessage").on('click', sendMessage);
    $("#linkMenuSendMessage").on('click', sendMessage);

    // Bind the form submit buttons
    $("#formLogin").on('submit', loginUser);
    $("#formRegister").on('submit', registerUser);
    $("#formSendMessage").on('submit', receiveMessage);
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

    if (sessionStorage.getItem('authToken')) {
        showUserHome()
    } else {
        showHomeView();
    }
}