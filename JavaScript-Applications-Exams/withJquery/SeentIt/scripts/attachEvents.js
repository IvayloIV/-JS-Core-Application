function attachAllEvents() {
    // Bind the navigation menu links
    $("#profile a").on('click', logoutUser);
    $("#menu .nav:first-of-type").on('click', catalog);
    $("#menu .nav:nth-of-type(2)").on('click', showCatalog);
    $("#menu .nav:nth-of-type(3)").on('click', viewMyPosts);

    // Bind the form submit buttons
    $("#loginForm").on('submit', loginUser);
    $("#registerForm").on('submit', registerUser);
    $("#submitForm").on('submit', createPost);
    $("#editPostForm").on('submit', editPost);
    $("#commentForm").on('submit', createComment);
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