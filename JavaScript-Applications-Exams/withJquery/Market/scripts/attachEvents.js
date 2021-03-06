function attachAllEvents() {
    // Bind the navigation menu links
    $("#linkMenuAppHome").on('click', showHomeView);
    $("#linkMenuLogin").on('click', showLoginView);
    $("#linkMenuRegister").on('click', showRegisterView);
    $("#linkMenuUserHome").on('click', showUserHome);
    $("#linkMenuLogout").on('click', logoutUser);
    $("#linkMenuShop").on('click', shop);
    $("#linkMenuCart").on('click', cart);

    // Bind the form submit buttons
    $("#formLogin").on('submit', loginUser);
    $("#formRegister").on('submit', registerUser);
    $("#linkUserHomeShop").on('click', shop);
    $("#linkUserHomeCart").on('click', cart);
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