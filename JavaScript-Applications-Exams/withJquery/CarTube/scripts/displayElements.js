function showView(viewName) {
    $('#container > div').hide();
    $('#container > div.footer').show();
    if (viewName.startsWith('.')){
        $(viewName).show();
    } else {
        $('#' + viewName).show();
    }
}

function showHideMenuLinks() {
	$('#profile a:first-of-type').text('');
    $("#active").show();
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#container nav a:nth-of-type(2)").hide();
        $("#container nav a:nth-of-type(3)").hide();
        $("#container nav a:nth-of-type(4)").hide();
        $("#profile").hide();
    } else { // We have logged in user
        $("#container nav a:nth-of-type(2)").show();
        $("#container nav a:nth-of-type(3)").show();
        $("#container nav a:nth-of-type(4)").show();
        $("#profile").show();
        $('#profile a:first-of-type').text("Welcome, " + sessionStorage.getItem('username'));
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
    errorBox.find('span').text(errorMsg);
    errorBox.show();
	setTimeout(function() {
        $('#errorBox').fadeOut();
    }, 3000)
}

function showHomeView() {
    if (sessionStorage.getItem('authToken')) {
        showUserHome()
    } else {
        showUnLoggedHome()
    }
}

function showUnLoggedHome() {
    showView('main');
}

async function showUserHome() {
    await showCars();
}

function showLoginView() {
    showView('login');
    $('#login form').trigger('reset');
}

function showRegisterView() {
    $('#register form').trigger('reset');
    showView('register');
}

function showCreateView() {
    showView('create-listing');
    $('#create-listing form').trigger('reset');
}