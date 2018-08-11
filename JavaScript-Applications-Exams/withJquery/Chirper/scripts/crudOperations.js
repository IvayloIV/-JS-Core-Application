function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="password"]').val();

    if (username.length < 5) {
        showError('Too short password!');
    } else if (password === '') {
        showError('Password can not be empty!');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="password"]').val();
    let repeatPass = $('#formRegister input[name="repeatPass"]').val();

    if (username.length < 5) {
        showError('Too short password!');
    } else if (password === '') {
        showError('Password can not be empty!');
    } else if (password !== repeatPass) {
        showError('Password does not match!');
    } else {
        remote.post('user', '', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'User registration successful.');
            }).catch(handleAjaxError);
    }
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
    let subs = [];
    if (userInfo.subscriptions !== undefined) {
        subs = userInfo.subscriptions;
    }
    sessionStorage.setItem('subscriptions', JSON.stringify(subs));
}
function logoutUser() {
	remote.post('user', '_logout', 'kinvey')
    .then(function () {
        sessionStorage.clear();
        showLoginView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

async function showHome() {
    try {
        let subs = sessionStorage.getItem('subscriptions');
        let username = sessionStorage.getItem('username');
        let allChirps = await remote.get('appdata',
            `chirps?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1}`,
            'kinvey');
        let countChirps = await remote.get('appdata',
            `chirps?query={"author":"${username}"}`,
            'kinvey');
        let followings = await remote.get('user',
            `?query={"username":"${username}"}`,
            'kinvey');
        let followers = await remote.get('user',
            `?query={"subscriptions":"${username}"}`,
            'kinvey');
        $('#formSubmitChirp').trigger('reset');
        let chirpsHtml = $('#viewFeed #chirps');
        chirpsHtml.find('article').remove();
        if (allChirps.length === 0) {
            chirpsHtml.append($('<article>').text('No chirps in database'));
        }
        for (let chirp of allChirps) {
            chirpsHtml.append($('<article>').addClass('chirp')
                .append($('<div>').addClass('titlebar')
                    .append($('<a>').attr('href', '#').addClass('chirp-author').text(chirp.author).on('click', viewProfile.bind(this, chirp.author)))
                    .append($('<span>').addClass('chirp-time').text(calcTime(chirp._kmd.ect))))
                .append($('<p>').text(chirp.text)));
        }
        let userStats = $('#viewFeed #userStats');
        userStats.find('span:nth-child(1)').text(`${countChirps.length} chirps`);
        let subsLength = 0;
        if (followings[0]['subscriptions'] !== undefined) {
            subsLength = followings[0]['subscriptions'].length;
        }
        userStats.find('span:nth-child(2)').text(`${subsLength} following`);
        userStats.find('span:nth-child(3)').text(`${followers.length} followers`);
        $('#viewFeed .chirper h2:first-of-type').text(username);
        showView('viewFeed');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createChirp(form) {
    try {
        let text = $(form).val();
        let author = sessionStorage.getItem('username');
        if (text === "") {
            showError('Text is empty!');
            return;
        } else if (text.length > 150) {
            showError('Too long text!');
            return;
        }
        await remote.post('appdata', `chirps`, 'kinvey', {text, author});
        showInfo('Chirp published.');
        viewMe();
    }catch (err) {
        handleAjaxError(err);
    }
}
async function viewMe() {
    try {
        let username = sessionStorage.getItem('username');
        let countChirps = await remote.get('appdata',
            `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`,
            'kinvey');
        let followings = await remote.get('user',
            `?query={"username":"${username}"}`,
            'kinvey');
        let followers = await remote.get('user',
            `?query={"subscriptions":"${username}"}`,
            'kinvey');
        $('#formSubmitChirpMy').trigger('reset');
        let chirpsHtml = $('#viewMe #myChirps');
        $('#myChirps .chirp').empty();
        chirpsHtml.find('article').remove();
        if (countChirps.length === 0) {
            chirpsHtml.append($('<article>').text('No chirps in database'));
        }
        for (let chirp of countChirps) {
            let article = $('<article>').addClass('chirp')
                .append($('<div>').addClass('titlebar')
                    .append($('<a>').attr('href', '#').addClass('chirp-author').text(chirp.author))
                    .append($('<span>').addClass('chirp-time').text(calcTime(chirp._kmd.ect))))
                .append($('<p>').text(chirp.text));
            if (chirp._acl.creator === sessionStorage.getItem('userId')) {
                article.find('.titlebar').append($('<a>').attr('href', '#').text('delete').on('click', viewMe)
                    .on('click', deleteChirp.bind(this, chirp)));
            }
            chirpsHtml.append(article);
        }
        let userStats = $('#viewMe #myStats');
        userStats.find('span:nth-child(1)').text(`${countChirps.length} chirps`);
        let subsLength = 0;
        if (followings[0]['subscriptions'] !== undefined) {
            subsLength = followings[0]['subscriptions'].length;
        }
        userStats.find('span:nth-child(2)').text(`${subsLength} following`);
        userStats.find('span:nth-child(3)').text(`${followers.length} followers`);
        $('#viewMe .chirper h2:first-of-type').text(username);
        showView('viewMe');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function deleteChirp(chirp) {
    try {
        await remote.remove('appdata', `chirps/` + chirp._id, 'kinvey');
        showInfo('Chirp deleted.');
        viewMe();
    } catch (err) {
        handleAjaxError(err);
    }
}

async function discover() {
    try {
        let users = await remote.get('user', ``, 'kinvey');
        let discoverHtml = $('#viewDiscover');
        discoverHtml.find('#userlist').empty();
        for (let user of users) {
            if (user._id === sessionStorage.getItem('userId')) {
                continue;
            }
            let currentSubs = users.filter(a => {
                return a['subscriptions'] !== undefined && a['subscriptions'].indexOf(user.username) !== -1;
            }).length;
            discoverHtml.find('#userlist')
                .append($('<div>').addClass('userbox')
                .append($('<div>')
                    .append($('<a>').attr('href', '#').addClass('chirp-author').text(user.username).on('click', viewProfile.bind(this, user.username))))
                .append($('<div>').addClass('user-details')
                    .append($('<span>').text(`${currentSubs} followers`))));
        }
        showView('viewDiscover');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function viewProfile(username) {
    try {
        if (sessionStorage.getItem('username') === username) {
            viewMe();
            return;
        }
        let countChirps = await remote.get('appdata',
            `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`,
            'kinvey');
        let followings = await remote.get('user',
            `?query={"username":"${username}"}`,
            'kinvey');
        let followers = await remote.get('user',
            `?query={"subscriptions":"${username}"}`,
            'kinvey');
        let followBtn = $('#btnFollow');
        followBtn.off('click');
        let currentSubs = JSON.parse(sessionStorage.getItem('subscriptions'));
        if (currentSubs.indexOf(username) === -1) {
            followBtn.text('Follow').on('click', followPerson.bind(this, username));
        } else {
            followBtn.text('Unfollow').on('click', unFollowPerson.bind(this, username));
        }
        let chirpsHtml = $('#viewProfile #profileChirps');
        $('#profileChirps .chirp').empty();
        chirpsHtml.find('article').remove();
        if (countChirps.length === 0) {
            chirpsHtml.append($('<article>').text('No chirps in database'));
        }
        for (let chirp of countChirps) {
            let article = $('<article>').addClass('chirp')
                .append($('<div>').addClass('titlebar')
                    .append($('<a>').attr('href', '#').addClass('chirp-author').text(chirp.author)
                        .on('click', viewProfile.bind(this, username)))
                    .append($('<span>').addClass('chirp-time').text(calcTime(chirp._kmd.ect))))
                .append($('<p>').text(chirp.text));
            chirpsHtml.append(article);
        }
        let userStats = $('#viewProfile #userProfileStats');
        userStats.find('span:nth-child(1)').text(`${countChirps.length} chirps`);
        let subsLength = 0;
        if (followings[0]['subscriptions'] !== undefined) {
            subsLength = followings[0]['subscriptions'].length;
        }
        userStats.find('span:nth-child(2)').text(`${subsLength} following`);
        userStats.find('span:nth-child(3)').text(`${followers.length} followers`);
        $('#viewProfile .chirper h2:first-of-type').text(username);
        showView('viewProfile');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function followPerson(username) {
    try {
        let subs = JSON.parse(sessionStorage.getItem('subscriptions'));
        if (subs.indexOf(username) === -1) {
            subs.push(username);
        }
        sessionStorage.setItem('subscriptions', JSON.stringify(subs));
        await remote.update('user', sessionStorage.getItem('userId'), 'kinvey', {subscriptions: subs});
        showInfo(`Subscribed to ${username}`);
        viewProfile(username);
    } catch (err) {
        handleAjaxError(err);
    }
}
async function unFollowPerson(username) {
    try {
        let subs = JSON.parse(sessionStorage.getItem('subscriptions'));
        let index = subs.indexOf(username);
        if (index !== -1) {
            subs.splice(index, 1);
        }
        sessionStorage.setItem('subscriptions', JSON.stringify(subs));
        await remote.update('user', sessionStorage.getItem('userId'), 'kinvey', {subscriptions: subs});
        showInfo(`Unsubscribed to ${username}`);
        viewProfile(username);
    } catch (err) {
        handleAjaxError(err);
    }
}

function calcTime(dateIsoFormat) {
    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);
    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}

function signInUser(res, message) {
    saveAuthInSession(res);
    showHome();
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