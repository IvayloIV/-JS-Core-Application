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
	remote.post('user', '', 'basic', {username, password})
    .then(function (currentUser) {
        signInUser(currentUser, 'User registration successful.');
    }).catch(handleAjaxError);
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
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

async function getCurrentUser() {
    return await remote.get('user', sessionStorage.getItem('userId'), 'kinvey');
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