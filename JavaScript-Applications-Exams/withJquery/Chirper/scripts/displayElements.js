function showView(viewName) {
    $('#main > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $(".menu").hide();
    } else { // We have logged in user
        $(".menu").show();
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox')
    infoBox.find('span').text(message)
    infoBox.show()
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.find('span').text("Error: " + errorMsg);
    errorBox.show();
    setTimeout(function() {
        $('#errorBox').fadeOut()
    }, 3000)
}

function showLoginView() {
    showView('viewLogin');
    $('#formLogin').trigger('reset');
}

function showRegisterView() {
    $('#formRegister').trigger('reset');
    showView('viewRegister');
}