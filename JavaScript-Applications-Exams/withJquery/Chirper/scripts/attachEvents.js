function attachAllEvents() {
    // Bind the navigation menu links
    $("#formLogin a").on('click', showRegisterView);
    $("#formRegister a").on('click', showLoginView);
    $(".menu a:last-child").on('click', logoutUser);
    $(".menu a:first-of-type").on('click', showHome);
    $(".menu a:nth-of-type(3)").on('click', viewMe);
    $(".menu a:nth-of-type(2)").on('click', discover);

    // Bind the form submit buttons
    $("#formLogin").on('submit', loginUser);
    $("#formRegister").on('submit', registerUser);
    $("#formSubmitChirp").on('submit', function () {
        createChirp('#formSubmitChirp textarea[name="text"]');
    });
    $("#formSubmitChirpMy").on('submit', function () {
        createChirp('#formSubmitChirpMy textarea[name="text"]');
    });
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