function showView(viewName) {
    $('main > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
	$('#spanMenuLoggedInUser').text('');
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#linkMenuAppHome").show();
        $("#linkMenuLogin").show();
        $("#linkMenuRegister").show();
        $("#linkMenuUserHome").hide();
        $("#linkMenuShop").hide();
        $("#linkMenuCart").hide();
        $("#linkMenuLogout").hide();
    } else { // We have logged in user
        $("#linkMenuAppHome").hide();
        $("#linkMenuLogin").hide();
        $("#linkMenuRegister").hide();
        $("#linkMenuUserHome").show();
        $("#linkMenuShop").show();
        $("#linkMenuCart").show();
        $("#linkMenuLogout").show();
        $('#spanMenuLoggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!")
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox')
    infoBox.text(message)
    infoBox.show()
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox')
    errorBox.text("Error: " + errorMsg)
    errorBox.show()
}

function showHomeView() {
    showView('viewAppHome')
}

function showUserHome() {
    $('#viewUserHomeHeading').text(`Welcome, ${sessionStorage.getItem('username')}!`);
    showView('viewUserHome')
}

function showLoginView() {
    showView('viewLogin')
    $('#formLogin').trigger('reset')
}

function showRegisterView() {
    $('#formRegister').trigger('reset')
    showView('viewRegister')
}