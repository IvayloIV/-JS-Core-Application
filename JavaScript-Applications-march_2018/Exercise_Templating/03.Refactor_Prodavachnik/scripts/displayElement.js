function showView(name){
    $('main > section').hide();
    $('#' + name).show();
}

function showHideMenuLinks() {
    let isAuthtoken = sessionStorage.getItem('authToken') === null;
    let menu = window.mainHeaders.unAuthHeader;
    if (isAuthtoken === true){
        menu = window.mainHeaders.authHeader;
    }
    $.get('./view/headers.hbs').then(function (source) {
        let template = Handlebars.compile(source);
        $('#menu').empty();
        $('#menu').append(template({header: menu}));
        attachAllEvents();
    });
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

async function showLoginView() {
    let source = await $.get('./view/logRegister.hbs');
    let template = Handlebars.compile(source);
    $('#viewLogin').empty();
    $('#viewLogin').append(template({
        lowerAction: 'login',
        upperAction: 'Login',
    }));
    showView('viewLogin');
    $('#buttonLoginUser').on('click', loginUser);
}

async function showRegisterView() {
    let source = await $.get('./view/logRegister.hbs');
    let template = Handlebars.compile(source);
    $('#viewRegister').empty();
    $('#viewRegister').append(template({
        lowerAction: 'register',
        upperAction: 'Register',
    }));
    showView('viewRegister');
    $('#buttonRegisterUser').on('click', registerUser);
}

async function showCreateAdView() {
    $('#viewCreateAd').empty();
    showView('viewCreateAd');
    let source = await $.get('./view/createEdit.hbs');
    let template = Handlebars.compile(source);
    $('#viewCreateAd').append(template({type: 'Create'}));
    $('#buttonCreateAd').on('click', createAd);
}