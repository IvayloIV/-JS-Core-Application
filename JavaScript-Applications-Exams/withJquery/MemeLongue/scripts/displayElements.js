function showView(viewName) {
    $('#container > div').hide();
    $('#container > div.footer').show();
    if (viewName.startsWith('.')) {
        $(viewName).show();
    } else {
        $('#' + viewName).show(); // Show the selected view only
    }
}

function showHideMenuLinks() {
    $('#container nav > #profile > a:first-of-type').text('');
    $('#container nav > a:first-of-type').show();
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $('#container nav > a:nth-of-type(2)').hide();
        $('#container nav > div').hide();
    } else {
        $('#container nav > a:nth-of-type(2)').show();
        $('#container nav > div').show();
        $('#container nav > #profile > a:first-of-type').text(`Welcome ${sessionStorage.getItem('username')}`);
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
    if (sessionStorage.getItem('userId')) {
        showAllMemes();
    } else {
        showView('main');
    }
}

function showLoginView() {
    showView('login');
    $('#login > form').trigger('reset');
}

function showCreateView() {
    showView('create-meme');
    $('#create-meme > form').trigger('reset');
}

function showRegisterView() {
    $('#register > form').trigger('reset');
    showView('register');
}