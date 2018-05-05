const APP_KEY = 'kid_Sy8Tyqh2G';
const APP_SECRET = 'f52ecf732385445cb3aab18fcad0bd3c';
const BASE_URL = 'https://baas.kinvey.com/';
let authHeaders = {'Authorization' : 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)};

function loginUser() {
    let username = $('#formLogin input[name=username]').val();
    let password = $('#formLogin input[name=passwd]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: authHeaders,
        data: JSON.stringify({username, password}),
        contentType: 'application/json'
    }).then(function (res) {
        totalSession(res);
        showInfo('Login success.');
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function registerUser() {
    let username = $('#formRegister input[name=username]').val();
    let password = $('#formRegister input[name=passwd]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY,
        headers: authHeaders,
        data: JSON.stringify({username, password}),
        contentType: 'application/json'
    }).then(function (res) {
        totalSession(res);
        showInfo('Register success.');
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function totalSession(res) {
    sessionStorage.setItem('authToken', res._kmd.authtoken);
    sessionStorage.setItem('username', res.username);
    sessionStorage.setItem('userID', res._acl.creator);
    showHideMenuLinks();
    showHomeView();
}

function showListAdsView() {
    $.ajax({
        method: 'GET',
        url : BASE_URL + 'appdata/' + APP_KEY + '/test',
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')}
    }).then(function (res) {
        showAdvert(res.reverse());
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function showAdvert(res) {
    showView('viewAds');
    $('#ads table tr').each((index, element) => {
        if (index > 0){
            $(element).remove();
        }
    });
    for (let i = 0; i < res.length; i++) {
        let tr = $($('<tr>'));
        $(tr)
            .append($('<td>').text(res[i].title))
            .append($('<td>').text(res[i].publisher))
            .append($('<td>').text(res[i].description))
            .append($('<td>').text(res[i].price))
            .append($('<td>').text(res[i].currentData));
        let td = $('<td>')
            .append($('<a>').attr('href', '#').text('[Read more]').on('click', function () {
                readMore(res[i]);
            }));
        if (res[i]._acl.creator === sessionStorage.getItem('userID')){
            $(td)
                    .append($('<a>').attr('href', '#').text('[Delete]').on('click', function () {
                        deleteBook(res[i]);
                    }))
                    .append($('<a>').attr('href', '#').text('[Edit]').on('click', function () {
                        viewEditAd(res[i]);
                    }));
        }
        $(tr).append(td);
        $('#ads table').append(tr);
    }
}

function viewEditAd(res) {
    showView('viewEditAd');
    $('#formEditAd input[name=id]').val(res._id);
    $('#formEditAd input[name=datePublished]').val(res.currentData);
    $('#formEditAd input[name=title]').val(res.title);
    $('#formEditAd input[name=price]').val(res.price);
    $('#formEditAd input[name=url]').val(res.url);
    $('#formEditAd textarea[name=description]').val(res.description);
}

function readMore(res) {
    showView('viewReadMore');
    $('#viewReadMore').empty();
    $('#viewReadMore')
        .append($(`<img src="${res.url}" height="300" width="400">`))
        .append($(`<div>`).text('Title:'))
        .append($(`<h2>`).text(res.title))
        .append($(`<div>`).text('Description:'))
        .append($(`<div>`).text(res.description))
        .append($(`<div>`).text('Publisher:'))
        .append($(`<div>`).text(res.publisher))
        .append($(`<div>`).text('Data:'))
        .append($(`<div>`).text(res.currentData))
        .append($(`<button>`).addClass('btn btn-primary').text('Back').on('click', function () {
            showListAdsView();
        }));
}

function editAd() {
    let id = $('#formEditAd input[name=id]').val();
    let currentData = $('#formEditAd input[name=datePublished]').val();
    let title = $('#formEditAd input[name=title]').val();
    let price = $('#formEditAd input[name=price]').val();
    let url = $('#formEditAd input[name=url]').val();
    let description = $('#formEditAd textarea[name=description]').val();
    let publisher = sessionStorage.getItem('username');
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/test/' + id,
        headers : {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')},
        data : JSON.stringify({currentData, title, price, description, publisher, url}),
        contentType : 'application/json'
    }).then(function () {
        showListAdsView();
        showInfo('Edited success.');
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function deleteBook(advert) {
    $.ajax({
        method: "DELETE",
        url: BASE_URL + "appdata/" + APP_KEY + "/test/" + advert._id,
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')},
    }).then(function (res) {
        showListAdsView();
        showInfo('Deleted success.');
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function createAd() {
    let title = $('#formCreateAd input[name=title]').val();
    let url = $('#formCreateAd input[name=url]').val();
    let description = $('#formCreateAd textarea[name=description]').val();
    let currentData = $('#formCreateAd input[name=datePublished]').val();
    let price = Number($('#formCreateAd input[name=price]').val());
    let publisher = sessionStorage.getItem('username');
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/test',
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')},
        data: JSON.stringify({title, description, currentData, price, publisher, url}),
        contentType: 'application/json'
    }).then(function () {
        showListAdsView();
        showInfo('Created new success.');
    }).catch(function () {
        errorInfo('Invalid data.');
    });
}

function logOut() {
    sessionStorage.clear();
    showHideMenuLinks();
    showHomeView();
    showInfo('Logout success.');
}