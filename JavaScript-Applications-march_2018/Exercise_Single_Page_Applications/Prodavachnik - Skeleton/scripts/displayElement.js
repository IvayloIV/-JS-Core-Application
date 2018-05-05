function showView(name){
    $('main > section').hide();
    $('#' + name).show();
}

function showHideMenuLinks() {
    $('#linkHome').show();
    if (sessionStorage.getItem('authToken') === null){
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();
        $('#linkLogout').hide();
    } else {
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListAds').show();
        $('#linkCreateAd').show();
        $('#linkLogout').show();
    }
}

function showInfo(message) {
    $('#infoBox').text(message).show();
    setTimeout(function () {
        $('#infoBox').fadeOut();
    }, 3000)
}

function errorInfo(message) {
    $('#errorBox').text(message).show();
    setTimeout(function () {
        $('#errorBox').fadeOut();
    }, 3000)
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    $('#formLogin').trigger('reset');
    showView('viewLogin');
}

function showRegisterView() {
    $('#formRegister').trigger('reset');
    showView('viewRegister');
}

function showCreateAdView() {
    $('#formCreateAd').trigger('reset');
    showView('viewCreateAd');
}