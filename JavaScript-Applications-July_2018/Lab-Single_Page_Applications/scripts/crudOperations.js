const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_HyEZInNTz';
const APP_SECRET = '9247924d115343b2822c4533ce791dc6';
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)};
const BOOKS_PER_PAGE = 10;

function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="passwd"]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
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
        headers: AUTH_HEADERS,
        data: JSON.stringify({username, password}),
        contentType: 'application/json'
    }).then(function (currentUser) {
        signInUser(currentUser, 'Registration successful.');
    }).catch(handleAjaxError);
}

function listBooks() {
    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')}
    }).then(function (allBooks) {
        showView('viewBooks');
        displayPaginationAndBooks(allBooks.reverse());
    }).catch(handleAjaxError);
}


function createBook() {
    let title = $('#formCreateBook input[name="title"]').val();
    let author = $('#formCreateBook input[name="author"]').val();
    let description = $('#formCreateBook textarea[name="description"]').val();

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')},
        data: JSON.stringify({title, author, description}),
        contentType: 'application/json'
    }).then(function () {
        listBooks();
        showInfo('Book created.');
    }).catch(handleAjaxError);
}

function deleteBook(tr, book) {
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id,
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')}
    }).then(function () {
        tr.remove();
        showInfo('Book deleted.');
    }).catch(handleAjaxError);
}

function loadBookForEdit(book) {
    showView('viewEditBook');
    $('#formEditBook input[name="id"]').val(book._id);
    $('#formEditBook input[name="title"]').val(book.title);
    $('#formEditBook input[name="author"]').val(book.author);
    $('#formEditBook textarea[name="description"]').val(book.description);
}

function editBook() {
    let id = $('#formEditBook input[name="id"]').val();
    let title = $('#formEditBook input[name="title"]').val();
    let author = $('#formEditBook input[name="author"]').val();
    let description = $('#formEditBook textarea[name="description"]').val();
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + id,
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')},
        data: JSON.stringify({title, author, description}),
        contentType: 'application/json'
    }).then(function () {
        listBooks();
        showInfo('Book edited.');
    }).catch(handleAjaxError);
}

function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
}

function logoutUser() {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/_logout',
        headers: {'Authorization' : 'Kinvey ' + sessionStorage.getItem('authToken')}
    }).then(function () {
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
		$('#loggedInUser').text('');
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

function signInUser(res, message) {
    saveAuthInSession(res);
    showHomeView();
    showHideMenuLinks();
    showInfo(message);
}

function displayPaginationAndBooks(books) {
    let pagination = $('#pagination-demo')
    if(pagination.data("twbs-pagination")){
        pagination.twbsPagination('destroy')
    }
    pagination.twbsPagination({
        totalPages: Math.ceil(books.length / BOOKS_PER_PAGE),
        visiblePages: 5,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            $('#books table tr').each((index, element) => {
                if (index > 0) {
                    element.remove();
                }
            });
            let startBook = (page - 1) * BOOKS_PER_PAGE
            let endBook = Math.min(startBook + BOOKS_PER_PAGE, books.length)
            $(`a:contains(${page})`).addClass('active')
            for (let i = startBook; i < endBook; i++) {
                let newTr = $('<tr>').append($('<td>').text(books[i]['title']))
                    .append($('<td>').text(books[i]['author']))
                    .append($('<td>').text(books[i]['description']));
                if (books[i]['_acl']['creator'] === sessionStorage.getItem('userId')) {
                    newTr.append($('<td>')
                        .append($('<a>').attr('href', '#').text('[Delete]').on('click', deleteBook.bind(this, newTr, books[i])))
                        .append($('<a>').attr('href', '#').text('[Edit]').on('click', loadBookForEdit.bind(this, books[i]))));
                }
                $('#books table').append(newTr);
            }
        }
    })
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}