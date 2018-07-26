const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_SkQonHDaM';
const APP_SECRET = '4986ecc2aec74faaa082c861a41bceac';

function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="passwd"]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: getAuth('Basic'),
        data: JSON.stringify({username, password}),
        contentType: 'application/json'
    }).then(function (currentUser) {
        signInUser(currentUser, 'Login successful.');
    }).catch(handleAjaxError);
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="passwd"]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: getAuth('Basic'),
        data: JSON.stringify({username, password}),
        contentType: 'application/json'
    }).then(function (currentUser) {
        signInUser(currentUser, 'User registration successful.');
    }).catch(handleAjaxError);
}
function logoutUser() {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/_logout',
        headers: getAuth('Kinvey')
    }).then(function () {
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

function createAd() {
    let title = $('#formCreateAd input[name="title"]').val();
    let description = $('#formCreateAd textarea[name="description"]').val();
    let datePublished = $('#formCreateAd input[name="datePublished"]').val();
    let image = $('#formCreateAd input[name="image"]').val();
    let price = Number($('#formCreateAd input[name="price"]').val()).toFixed(2);
    let publisher = sessionStorage.getItem('username');
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/totalAd',
        headers: getAuth('Kinvey'),
        data: JSON.stringify({title, description, datePublished, price, publisher, image}),
        contentType: 'application/json'
    }).then(function () {
        listAds();
        showInfo('Advert created.');
    }).catch(handleAjaxError);
}
function listAds() {
    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + '/totalAd',
        headers: getAuth('Kinvey')
    }).then(function (allAds) {
        let ads = $('<div>').attr('id', 'ads').attr('class', 'ads');
        let viewAds = $('#viewAds');
        viewAds.empty();
        if (allAds.length === 0) {
            ads.append($('<h2>').text('Advertisements'))
                .append($('<p>').text('No advertisements available'));
        } else {
            viewAds.append($('<h1>').addClass('titleForm').text('Advertisements'));
            ads.append($('<table>')
                .append($('<tr>')
                    .append($('<th>').text('Title'))
                    .append($('<th>').text('Description'))
                    .append($('<th>').text('Publisher'))
                    .append($('<th>').text('Date Published'))
                    .append($('<th>').text('Price'))
                    .append($('<th>').text('Actions'))));
            for (let currentAd of allAds) {
                let newTr = $('<tr>')
                    .append($('<td>').text(currentAd.title))
                    .append($('<td>').text(currentAd.description))
                    .append($('<td>').text(currentAd.publisher))
                    .append($('<td>').text(currentAd.datePublished))
                    .append($('<td>').text(currentAd.price))
                    .append($('<td>')
                        .append($('<a>').attr('href', '#').text('[Read More]').on('click', readMoreAd.bind(this, currentAd))));
                if (currentAd._acl.creator === sessionStorage.getItem('userId')) {
                    newTr.find('td:last-child')
                        .append($('<a>').attr('href', '#').text('[Delete]').on('click', deleteAd.bind(this, currentAd._id)))
                        .append($('<a>').attr('href', '#').text('[Edit]').on('click', showEditForm.bind(this, currentAd)));
                }
                ads.find('table').append(newTr);
            }
        }
        viewAds.append(ads);
        showView('viewAds');
    }).catch(handleAjaxError);
}
function deleteAd(adId) {
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/totalAd/' + adId,
        headers: getAuth('Kinvey')
    }).then(function () {
        listAds();
        showInfo('Advert deleted.')
    }).catch(handleAjaxError);
}
function showEditForm(ad) {
    $('#formEditAd input[name="title"]').val(ad.title);
    $('#formEditAd textarea[name="description"]').val(ad.description);
    $('#formEditAd input[name="datePublished"]').val(ad.datePublished);
    $('#formEditAd input[name="price"]').val(Number(ad.price));
    $('#formEditAd input[name="id"]').val(ad._id);
    $('#formEditAd input[name="publisher"]').val(ad.publisher);
    $('#formEditAd input[name="image"]').val(ad.image);
    showView('viewEditAd');
}
function editAd() {
    let title = $('#formEditAd input[name="title"]').val();
    let description = $('#formEditAd textarea[name="description"]').val();
    let datePublished = $('#formEditAd input[name="datePublished"]').val();
    let price = Number($('#formEditAd input[name="price"]').val()).toFixed(2);
    let id = $('#formEditAd input[name="id"]').val();
    let publisher = $('#formEditAd input[name="publisher"]').val();
    let image = $('#formEditAd input[name="image"]').val();

    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/totalAd/' + id,
        headers: getAuth('Kinvey'),
        data: JSON.stringify({title, description, datePublished, price, publisher, image}),
        contentType: 'application/json'
    }).then(function () {
        listAds();
        showInfo('Advert edited.');
    }).catch(handleAjaxError);
}
function readMoreAd(currentAd) {
    let viewDetailsAd = $('#viewDetailsAd');
    viewDetailsAd.empty();
    viewDetailsAd.append($('<img>').attr('src', currentAd.image).attr('alt', 'image').attr('height', 200).attr('wight', 100))
        .append($('<h4>').text('Title:'))
        .append($('<h1>').text(currentAd.title))
        .append($('<h4>').text('Description:'))
        .append($('<p>').text(currentAd.description))
        .append($('<h4>').text('Publisher:'))
        .append($('<p>').text(currentAd.publisher))
        .append($('<h4>').text('Date:'))
        .append($('<p>').text(currentAd.datePublished));
    showView('viewDetailsAd');
}

async function getCurrentUser() {
    return await $.ajax({
        method: 'GET',
        url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')}
    });
}
function getAuth(type) {
    if (type === 'Basic') {
        return {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)};
    } else {
        return {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')};
    }
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
}
function signInUser(res, message) {
    saveAuthInSession(res);
    showHomeView();
    showHideMenuLinks();
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