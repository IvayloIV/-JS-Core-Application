function showView(viewName) {
    $('#container > section').hide();
    $('#' + viewName).show();
}

function showHideMenuLinks() {
	$('#cashier a').text('');
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#profile").hide();
    } else { // We have logged in user
        $("#profile").show();
        $('#cashier a').text(sessionStorage.getItem('username'));
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox');
    infoBox.find('span').text(message);
    infoBox.show();
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.find('span').text("Error: " + errorMsg);
    errorBox.show()
    setTimeout(function() {
        $('#errorBox').fadeOut()
    }, 3000)
}

function showHomeView() {
    $('#login-form').trigger('reset');
    $('#register-form').trigger('reset');
    showView('welcome-section');
}