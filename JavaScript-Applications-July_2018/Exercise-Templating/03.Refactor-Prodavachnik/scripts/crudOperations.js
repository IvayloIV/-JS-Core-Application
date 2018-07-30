// Loading forms and articles
async function loadHeader() {
    let source = await $.get('./templates/common/header.hbs');
    let template = Handlebars.compile(source);
    let header = template({
        username: sessionStorage.getItem('username'),
        isAuth: sessionStorage.getItem('authToken')
    });
    Handlebars.registerPartial('header', header);
}
async function loadFooter() {
    let source = await $.get('./templates/common/footer.hbs');
    let template = Handlebars.compile(source);
    let footer = template();
    Handlebars.registerPartial('footer', footer);
}
async function loadLoginForm() {
    let source = await $.get('./templates/login/loginForm.hbs');
    let template = Handlebars.compile(source);
    let loginForm = template();
    Handlebars.registerPartial('loginForm', loginForm);
}
async function loadRegisterForm() {
    let source = await $.get('./templates/register/formRegister.hbs');
    let template = Handlebars.compile(source);
    let loginForm = template();
    Handlebars.registerPartial('formRegister', loginForm);
}
async function loadCreateForm() {
    let source = await $.get('./templates/createAds/formCreateAds.hbs');
    let template = Handlebars.compile(source);
    let formCreateAds = template();
    Handlebars.registerPartial('formCreateAds', formCreateAds);
}
async function loadTableAds(ads) {
    let source = await $.get('./templates/viewAds/tableAds.hbs');
    let template = Handlebars.compile(source);
    let tableHtml = template({ads});
    Handlebars.registerPartial('tableAds', tableHtml);
}
async function loadEditAdForm(ads) {
    let source = await $.get('./templates/editAd/formEditAd.hbs');
    let template = Handlebars.compile(source);
    ads.price = Number(ads.price);
    let tableHtml = template({ad: ads});
    Handlebars.registerPartial('formEditAd', tableHtml);
}
function attachWelcomeEvents() {
    $("#linkHome").on('click', loadWelcomePage);
    if (!sessionStorage.getItem('authToken')) {
        $("#linkLogin").on('click', loadLoginPage);
        $("#linkRegister").on('click', loadRegisterPage);
    } else {
        $("#linkLogout").on('click', logoutUser);
        $("#linkListAds").on('click', listAds);
        $("#linkCreateAd").on('click', loadCreatePage);
    }
}

// Loading main pages
async function loadWelcomePage() {
    let main = $('#main');
    await loadHeader();
    await loadFooter();
    let sourceMainView = await $.get('./templates/welcomePage/mainWelcome.hbs');
    let template = Handlebars.compile(sourceMainView);
    main.empty();
    main.append(template());
    attachWelcomeEvents();
}
async function loadLoginPage() {
    let main = $('#main');
    main.empty();
    await loadLoginForm();
    let sourceMainView = await $.get('./templates/login/mainLogin.hbs');
    let template = Handlebars.compile(sourceMainView);
    main.append(template());
    $("#buttonLoginUser").on('click', loginUser);
    attachWelcomeEvents();
}
async function loadRegisterPage() {
    let main = $('#main');
    main.empty();
    await loadRegisterForm();
    let sourceMainView = await $.get('./templates/register/mainRegister.hbs');
    let template = Handlebars.compile(sourceMainView);
    main.append(template());
    $("#buttonRegisterUser").on('click', registerUser);
    attachWelcomeEvents();
}
async function loadCreatePage() {
    let main = $('#main');
    main.empty();
    await loadCreateForm();
    let sourceCreateView = await $.get('./templates/createAds/mainCreateAds.hbs');
    let template = Handlebars.compile(sourceCreateView);
    main.append(template());
    $("#buttonCreateAd").on('click', createAd);
    attachWelcomeEvents();
}

//Basic pages
function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="passwd"]').val();
    remote.post('user', 'login', 'basic', {username, password})
        .then(function (currentUser) {
        signInUser(currentUser, 'Login successful.');
    }).catch(handleAjaxError);
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="passwd"]').val();
    remote.post('user', '', 'basic', {username, password})
        .then(function (currentUser) {
        signInUser(currentUser, 'User registration successful.');
    }).catch(handleAjaxError);
}
function logoutUser() {
    remote.post('user', '_logout', 'kinvey')
        .then(function () {
        sessionStorage.clear();
        loadWelcomePage();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

//CRUD pages
function createAd() {
    let title = $('#formCreateAd input[name="title"]').val();
    let description = $('#formCreateAd textarea[name="description"]').val();
    let datePublished = $('#formCreateAd input[name="datePublished"]').val();
    let image = $('#formCreateAd input[name="image"]').val();
    let price = Number($('#formCreateAd input[name="price"]').val()).toFixed(2);
    let publisher = sessionStorage.getItem('username');
    remote.post('appdata', 'totalAd', 'kinvey', {title, description, datePublished, price, publisher, image})
    .then(function () {
        listAds();
        showInfo('Advert created.');
    }).catch(handleAjaxError);
}
async function listAds() {
    remote.get('appdata', 'totalAd', 'kinvey')
    .then(function (allAds) {
        for (let ad of allAds) {
            ad.isOwner = ad._acl.creator === sessionStorage.getItem('userId');
        }
            loadTableAds(allAds)
                .then(function () {
                    let main = $('#main');
                    main.empty();
                    $.get('./templates/viewAds/mainViewAds.hbs').then(function (sourceAds) {
                        let template = Handlebars.compile(sourceAds);
                        main.append(template());
                        $('td a:contains("[Delete]")').on('click', deleteAd);
                        $('td a:contains("[Edit]")').on('click', showEditForm);
                        $('td a:contains("[Read More]")').on('click', readMoreAd);
                        attachWelcomeEvents();
                    });
                }).catch(handleAjaxError);
    }).catch(handleAjaxError);
}
function deleteAd() {
    let adId = $(this).parent().parent().find('td:first-child').text();
    remote.remove('appdata', `totalAd/${adId}`, 'kinvey')
    .then(function () {
        listAds();
        showInfo('Advert deleted.')
    }).catch(handleAjaxError);
}
function showEditForm() {
    let idAd = $(this).parent().parent().find('td:first-child').text();
    remote.get('appdata', `totalAd/${idAd}`, 'kinvey')
    .then(function (ad) {
        loadEditAdForm(ad).then(function () {
            let main = $('#main');
            main.empty();
            $.get('./templates/editAd/mainEditAd.hbs').then(function (sourceAds) {
                let template = Handlebars.compile(sourceAds);
                main.append(template());
                attachWelcomeEvents();
                $("#buttonEditAd").on('click', editAd);
            });
        }).catch(handleAjaxError);
    }).catch(handleAjaxError);
}
function editAd() {
    let title = $('#formEditAd input[name="title"]').val();
    let description = $('#formEditAd textarea[name="description"]').val();
    let datePublished = $('#formEditAd input[name="datePublished"]').val();
    let price = Number($('#formEditAd input[name="price"]').val()).toFixed(2);
    let id = $('#formEditAd input[name="id"]').val();
    let publisher = $('#formEditAd input[name="publisher"]').val();
    let image = $('#formEditAd input[name="image"]').val();

    remote.update('appdata', `totalAd/${id}`, 'kinvey', {title, description, datePublished, price, publisher, image})
    .then(function () {
        listAds();
        showInfo('Advert edited.');
    }).catch(handleAjaxError);
}
async function readMoreAd() {
    let id = $(this).parent().parent().find('td:first-child').text();
    let currentAd;
    try {
        currentAd = await remote.get('appdata', `totalAd/${id}`, 'kinvey');
    } catch (err) {
        handleAjaxError(err);
    }
    let main = $('#main');
    main.empty();
    let sourceAd = await $.get('./templates/viewDetailsAd/mainDetailsAd.hbs');
    let template = Handlebars.compile(sourceAd);
    main.append(template({ad: currentAd}));
    $('#viewDetailsAd button').on('click', listAds);
    attachWelcomeEvents();
}

//Helper func
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
}
async function signInUser(res, message) {
    saveAuthInSession(res);
    await loadWelcomePage();
    showInfo(message);
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg)
}