function showView(viewName) {
    $('.content > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
	$('#profile').find('span').text('');
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#menu").hide();
        $('#profile').hide();
    } else { // We have logged in user
        $("#menu").show();
        $('#profile').show();
        $('#profile').find('span').text(sessionStorage.getItem('username'));
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
    errorBox.show()
    setTimeout(function() {
        $('#errorBox').fadeOut()
    }, 3000)
}

function showHomeView() {
    showView('viewWelcome')
}

function showCatalog() {
    $('#submitForm').trigger('reset');
    showView('viewSubmit');
}