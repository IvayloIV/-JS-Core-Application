function loginUser() {
    let username = $('#login input[name="username"]').val();
    let password = $('#login input[name="password"]').val();

    if (!/^[A-Za-z]{3,}$/.test(username)) {
        showError('A username should be at least 3 characters long and should contain only english alphabet letters.');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
        showError('A user‘s password should be at least 6 characters long and should contain only english alphabet letters and digits.');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#register input[name="username"]').val();
    let password = $('#register input[name="password"]').val();
    let repeatPass = $('#register input[name="repeatPass"]').val();
    let email = $('#register input[name="email"]').val();
    let avatarUrl = $('#register input[name="avatarUrl"]').val();

    if (!/^[A-Za-z]{3,}$/.test(username)) {
        showError('A username should be at least 3 characters long and should contain only english alphabet letters.');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
        showError('A user‘s password should be at least 6 characters long and should contain only english alphabet letters and digits.');
    } else if (repeatPass !== password) {
        showError('Both passwords must match!');
    } else {
        remote.post('user', '', 'basic', {username, password, email, avatarUrl})
            .then(function (currentUser) {
                signInUser(currentUser, 'User registration successful.');
            }).catch(handleAjaxError);
    }
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

async function showAllMemes() {
    try {
        let memes = await remote.get('appdata', `memes?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
        let memesHtml = $('#meme-feed #memes');
        memesHtml.empty();

        if (memes.length === 0) {
            memesHtml.append($('<p>').addClass('no-memes').text('No memes in database.'));
        } else {
            for (let meme of memes) {
                let html = $('<div>').addClass('meme')
                    .append($('<a>').attr('href', '#').addClass('meme-title').text(meme.title).on('click', this.memeDetails.bind(this, meme)))
                    .append($('<br>'))
                    .append($('<a>').attr('href', '#')
                        .append($('<img>').addClass('meme-image').attr('src', meme.imageUrl).on('click', this.memeDetails.bind(this, meme))))
                    .append($('<div>').addClass('info')
                        .append($('<div>').attr('id', 'data-buttons')
                            .append($('<a>').attr('href', '#').addClass('custom-button').text('Check Out').on('click', this.memeDetails.bind(this, meme)))));
                if (meme._acl.creator === sessionStorage.getItem('userId')) {
                    html.find('#data-buttons')
                        .append($('<a>').attr('href', '#').addClass('custom-button').text('Edit').on('click', this.showEditForm.bind(this, meme)))
                        .append($('<a>').attr('href', '#').addClass('custom-button').text('Delete').on('click', this.deleteMeme.bind(this, meme._id)));
                }
                html.find('#data-buttons').append($('<a>').attr('href', '#').addClass('creator').text(`Creator: ${meme.creator}`).on('click', this.profile.bind(this, meme.creator)));
                html.append('<hr>');

                memesHtml.append(html);
            }
        }
        showView('meme-feed');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createMeme() {
    try {
        let title = $('#create-meme input[name="title"]').val();
        let description = $('#create-meme input[name="description"]').val();
        let imageUrl = $('#create-meme input[name="imageUrl"]').val();
        let creator = sessionStorage.getItem('username');

        if (title.length > 33) {
            showError(`The title length must not exceed 33 characters!`);
        } else if (description.length < 30 || description.length > 450) {
            showError(`The description length must not exceed 450 characters and should be at least 30!`);
        } else if (!imageUrl.startsWith('http')) {
            showError('Link url should always start with "http".');
        } else if (title.length === 0 || description.length === 0 || imageUrl.length === 0) {
            showError('Fill all inputs!')
        } else {
            await remote.post('appdata', `memes`, 'kinvey', {title, description, imageUrl, creator});
            await showAllMemes();
            showInfo('meme created.');
        }
    } catch (err) {
        handleAjaxError(err);
    }
}

function showEditForm(meme) {
    let form = $('#edit-meme > form');
    form.attr('data-id', meme._id);
    form.trigger('reset');
    form.find('input[name="title"]').val(meme.title);
    form.find('input[name="description"]').val(meme.description);
    form.find('input[name="imageUrl"]').val(meme.imageUrl);

    showView('edit-meme');
}
async function editMeme() {
    try {
        let form = $('#edit-meme > form');
        let title = form.find('input[name="title"]').val();
        let description = form.find('input[name="description"]').val();
        let imageUrl = form.find('input[name="imageUrl"]').val();
        let creator = sessionStorage.getItem('username');
        let idMeme = form.attr('data-id');

        if (title.length > 33) {
            showError(`The title length must not exceed 33 characters!`);
        } else if (description.length < 30 || description.length > 450) {
            showError(`The description length must not exceed 450 characters and should be at least 30!`);
        } else if (!imageUrl.startsWith('http')) {
            showError('Link url should always start with "http".');
        } else if (title.length === 0 || description.length === 0 || imageUrl.length === 0) {
            showError('Fill all inputs!')
        } else {
            await remote.update('appdata', `memes/${idMeme}`, 'kinvey', {title, description, imageUrl, creator});
            await showAllMemes();
            showInfo(`Meme ${title} updated.`);
        }
    } catch (err) {
        handleAjaxError(err);
    }
}

async function deleteMeme(memeId) {
    try {
        await remote.remove('appdata', `memes/${memeId}`, 'kinvey');
        await showAllMemes();
        showInfo('Meme deleted.');
    } catch (err) {
        handleAjaxError(err);
    }
}
function memeDetails(meme) {
    let memeDetailsHtml = $('.meme-details > .my-meme-details');
    memeDetailsHtml.empty();
    memeDetailsHtml.append($('<a>').attr('href', '#').attr('id', 'meme-title').text(meme.title).on('click', this.memeDetails.bind(this, meme)))
        .append($('<img>').attr('src', meme.imageUrl).on('click', this.memeDetails.bind(this, meme)))
        .append($('<div>').addClass('meme-props')
            .append($('<h2>').text('Description'))
            .append($('<p>').addClass('meme-description').text(meme.description)))
        .append($('<div>').addClass('meme-details-buttons')
            .append($('<a>').addClass('meme-details-button').attr('href', '#').text(`Created by ${meme.creator}`).on('click', this.profile.bind(this, meme.creator))));
    if (meme._acl.creator === sessionStorage.getItem('userId')){
        memeDetailsHtml.find('div.meme-details-buttons')
            .append($('<a>').attr('href', '#').addClass('meme-details-button').text('Edit').on('click', this.showEditForm.bind(this, meme)))
            .append($('<a>').attr('href', '#').addClass('meme-details-button').text('Delete').on('click', this.deleteMeme.bind(this, meme._id)));
    }


    showView('.meme-details');
}

async function profile(username) {
    try {
        let users = await remote.get('user', `?query={"username":"${username}"}`, 'kinvey');
        let user = users[0];
        let memes = await remote.get('appdata', `memes?query={"creator":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');

        let userProfileHtml = $('div.user-profile');
        userProfileHtml.empty();
        userProfileHtml.append($('<img>').attr('id', 'user-avatar-url').attr('src', user.avatarUrl))
            .append($('<h1>').text(user.username))
            .append($('<h2>').text(user.email));

        if (user._acl.creator === sessionStorage.getItem('userId')) {
            userProfileHtml.append($('<a>').attr('id', 'deleteUserButton').attr('href', '#').text('DELETE USER!').on('click', this.deleteProfile.bind(this, user._id)));
        }

        userProfileHtml.append($('<p>').attr('id', 'user-listings-title').text(`User Memes`))
            .append($('<div>').addClass('user-meme-listings'));
        if (memes.length === 0) {
            userProfileHtml.find('div.user-meme-listings').append($('<p>').addClass('no-memes').text('No memes in database.'));
        } else {
            for (let meme of memes) {
                let currentHtml = $(`<div>`).addClass('user-meme')
                    .append($('<a>').attr('href', '#').addClass('user-meme-title').text(meme.title).on('click', this.memeDetails.bind(this, meme)))
                    .append($('<a>').attr('href', '#')
                        .append($('<img>').attr('src', meme.imageUrl).on('click', this.memeDetails.bind(this, meme))));
                if (meme._acl.creator === sessionStorage.getItem('userId')) {
                    currentHtml.append($('<div>').addClass('user-memes-buttons')
                        .append($('<a>').attr('href', '#').addClass('user-meme-btn').text('Edit').on('click', this.showEditForm.bind(this, meme)))
                        .append($('<a>').attr('href', '#').addClass('user-meme-btn').text('Delete').on('click', this.deleteMeme.bind(this, meme._id))));
                }
                userProfileHtml.find('div.user-meme-listings').append(currentHtml);
            }
        }
        showView('.user-profile');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function deleteProfile(profileId) {
    try {
        await remote.remove('user', profileId, 'kinvey');
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
        showInfo('User deleted.');
    } catch (err) {
        handleAjaxError(err);
    }
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