function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="password"]').val();
	remote.post('user', 'login', 'basic', {username, password})
    .then(function (currentUser) {
        signInUser(currentUser, 'Login successful.');
    }).catch(handleAjaxError);
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="password"]').val();
    let name = $('#formRegister input[name="name"]').val();
	remote.post('user', '', 'basic', {username, password, name})
    .then(function (currentUser) {
        signInUser(currentUser, 'User registration successful.');
    }).catch(handleAjaxError);
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('name', userInfo.name);
}
function logoutUser() {
	remote.post('user', '_logout', 'kinvey')
    .then(function () {
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

function myMessages() {
    remote.get(`appdata`, `messages?query={"recipient_username":"${sessionStorage.getItem('username')}"}`, `kinvey`)
        .then(function (messages) {
            let messagesHtml = $('#myMessages tbody');
            messagesHtml.empty();
            for (const message of messages) {
                messagesHtml.append($('<tr>')
                    .append($('<td>').text(`${formatSender(message.sender_name, message.sender_username)}`))
                    .append($('<td>').text(message.text))
                    .append($('<td>').text(formatDate(message._kmd.ect))))
            }
            showView('viewMyMessages');
        })
        .catch(handleAjaxError);
}
function sentArchive() {
    remote.get(`appdata`, `messages?query={"sender_username":"${sessionStorage.getItem('username')}"}`, `kinvey`)
        .then(function (messages) {
            let messagesHtml = $('#viewArchiveSent tbody');
            messagesHtml.empty();
            for (const message of messages) {
                let tr = $('<tr>')
                    .append($('<td>').text(message.recipient_username))
                    .append($('<td>').text(message.text))
                    .append($('<td>').text(formatDate(message._kmd.ect)));
                messagesHtml.append(tr
                    .append($('<td>')
                        .append($('<button>').text('Delete').on('click', deleteMessage.bind(this, message._id, tr)))))
            }
            showView('viewArchiveSent');
        })
        .catch(handleAjaxError);
}
function deleteMessage(id, messagesHtml) {
    remote.remove('appdata', `messages/${id}`, 'kinvey')
        .then(function () {
            showInfo('Message deleted.');
            messagesHtml.remove();
        })
        .catch(handleAjaxError);
}
function sendMessage() {
    remote.get('user', '', 'kinvey')
        .then(function (users) {
            $('#formSendMessage').trigger('reset');
            let select = $('#msgRecipientUsername');
            select.empty();
            for (let user of users) {
                select.append($('<option>').text(formatSender(user.name, user.username)).val(user.username));
            }
            showView('viewSendMessage');
        })
        .catch(handleAjaxError);
}
function receiveMessage() {
    let recipient_username = $('#msgRecipientUsername option:selected').val();
    let text = $('#msgText').val();
    let sender_username = sessionStorage.getItem('username');
    let sender_name = sessionStorage.getItem('name');
    remote.post('appdata', `messages`, 'kinvey', {recipient_username, text, sender_username, sender_name})
        .then(function () {
            showInfo('Message sent.');
            sentArchive();
        })
        .catch(handleAjaxError);
}


function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
        return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}
function formatSender(name, username) {
    if (!name)
        return username;
    else
        return username + ' (' + name + ')';
}

function signInUser(res, message) {
    saveAuthInSession(res);
    showUserHome();
    showHideMenuLinks();
    showInfo(message);
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}