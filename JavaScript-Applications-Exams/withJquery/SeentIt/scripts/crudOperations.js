function loginUser() {
    let username = $('#loginForm input[name="username"]').val();
    let password = $('#loginForm input[name="password"]').val();
    if (!/^[A-Za-z]{3,}$/.test(username)) {
        showError('Invalid username!');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
        showError('Invalid password!');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                $('#loginForm').trigger('reset')
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#registerForm input[name="username"]').val();
    let password = $('#registerForm input[name="password"]').val();
    let repeatPass = $('#registerForm input[name="repeatPass"]').val();

    if (!/^[A-Za-z]{3,}$/.test(username)) {
        showError('Invalid username!');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
        showError('Invalid password!');
    } else if (repeatPass !== password) {
        showError('Passwords does not match!');
    } else {
        remote.post('user', '', 'basic', {username, password})
            .then(function (currentUser) {
                $('#registerForm').trigger('reset')
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

async function catalog() {
    try {
        let posts = await remote.get('appdata', `posts?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
        let postHtml = $('.posts');
        postHtml.empty();
        if (posts.length === 0) {
            postHtml.append($('<p>').text('No posts in database'));
        }
        let rank = 1;
        for (let post of posts) {
            let article = getArticle(post, rank++);
            postHtml.append(article);
        }
        showView('viewCatalog');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createPost() {
    try {
        let url = $('#submitForm input[name="url"]').val();
        let title = $('#submitForm input[name="title"]').val();
        let imageUrl = $('#submitForm input[name="image"]').val();
        let description = $('#submitForm textarea[name="comment"]').val();
        let author = sessionStorage.getItem('username');

        if (url === '') {
            showError('Empty url!');
        } else if (title === '') {
            showError('Empty title!');
        } else if (!url.startsWith('http')) {
            showError('Url should start with http!');
        } else {
            await remote.post('appdata', 'posts', 'kinvey', {author ,url ,title , imageUrl, description});
            showInfo('Post created.');
            catalog();
        }
    } catch (err) {
        handleAjaxError(err);
    }
}
async  function viewMyPosts() {
    try {
        let posts = await remote.get('appdata',
            `posts?query={"author":"${sessionStorage.getItem('username')}"}&sort={"_kmd.ect": -1}`,
            'kinvey');
        let postHtml = $('#viewMyPosts .posts');
        postHtml.empty();
        if (posts.length === 0) {
            postHtml.append($('<p>').text('No posts in database'));
        }
        let rank = 1;
        for (let post of posts) {
            let article = getArticle(post, rank++);
            postHtml.append(article);
        }
        showView('viewMyPosts');
    }catch (err) {
        handleAjaxError(err);
    }
}
function showEdit(post) {
    $('#editPostForm').trigger('reset');
    $('#editPostForm').attr('data-id', post._id);
    $('#editPostForm input[name="url"]').val(post.url);
    $('#editPostForm input[name="title"]').val(post.title);
    $('#editPostForm input[name="image"]').val(post.imageUrl);
    $('#editPostForm textarea[name="description"]').val(post.description);
    showView('viewEdit');
}
async function editPost() {
    try {
        let url = $('#editPostForm input[name="url"]').val();
        let title = $('#editPostForm input[name="title"]').val();
        let imageUrl = $('#editPostForm input[name="image"]').val();
        let description = $('#editPostForm textarea[name="description"]').val();
        let author = sessionStorage.getItem('username');
        let idPost = $('#editPostForm').attr('data-id');

        if (url === '') {
            showError('Empty url!');
        } else if (title === '') {
            showError('Empty title!');
        } else if (!url.startsWith('http')) {
            showError('Url should start with http!');
        } else {
            await remote.update('appdata',
                'posts/' + idPost,
                'kinvey',
                {author ,url ,title , imageUrl, description});
            showInfo(`Post ${title} updated.`);
            catalog();
        }
    } catch (err) {
        handleAjaxError(err);
    }
}
async function deletePost(post) {
    try {
        await remote.remove('appdata', 'posts/' + post._id, 'kinvey');
        showInfo('Post deleted.');
        catalog();
    } catch (err) {
        handleAjaxError(err);
    }
}

async function showComments(postId) {
    try {
        let post = await remote.get('appdata', 'posts/' + postId, 'kinvey');
        let postHtml = $('#viewComments .post:first-of-type');
        postHtml.find('div:first-of-type a').attr('href', post.url);
        postHtml.find('div:first-of-type img').attr('src', post.imageUrl);
        postHtml.find('.post-content .title a').attr('href', post.url).text(post.title);
        postHtml.find('.post-content .details p').text(post.description === '' ? 'No description' : post.description);
        postHtml.find('.post-content .info').text(`submitted ${calcTime(post._kmd.ect)} ago by ${post.author}`);
        postHtml.find('.post-content .controls').empty();
        if (post._acl.creator === sessionStorage.getItem('userId')) {
            postHtml.find('.post-content .controls')
                .append($('<ul>')
                    .append($('<li>').addClass('action')
                        .append($('<a>').addClass('editLink').attr('href', '#').text('edit'))
                        .on('click', showEdit.bind(this, post)))
                    .append($('<li>').addClass('action')
                        .append($('<a>').addClass('deleteLink').attr('href', '#').text('delete'))
                        .on('click', deletePost.bind(this, post))));
        }
        $('#commentForm').trigger('reset');
        $('#commentForm textarea').text('');
        $('#commentForm').attr('data-id', post._id);
        $('#viewComments article').remove();
        let comments = await remote.get('appdata',
            `comments?query={"postId":"${post._id}"}&sort={"_kmd.ect": -1}`,
            'kinvey');
        if (comments.length === 0) {
            $('#viewComments').append($('<article>').text('No comments yet.'));
        }
        for (let comment of comments) {
            let article = $('<article>').addClass('post post-content')
                .append($('<p>').text(comment.content))
                .append($('<div>').addClass('info').text(`submitted ${calcTime(comment._kmd.ect)} ago by ${comment.author}`));
            if (comment._acl.creator === sessionStorage.getItem('userId')) {
                article.find('.info').text(article.find('.info').text() + ' | ')
                    .append($('<a>').attr('href', '#').addClass('deleteLink').text('delete')
                        .on('click', deleteComment.bind(this, comment)))
            }
            $('#viewComments').append(article);
        }
        showView('viewComments');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createComment() {
    try {
        let postId = $('#commentForm').attr('data-id');
        let content = $('#commentForm textarea[name="content"]').val();
        let author = sessionStorage.getItem('username');
        if (content === "") {
            showError('Content is empty!');
        } else {
            await remote.post('appdata', `comments`, 'kinvey', {postId, content, author});
            showInfo('Comment created.');
            showComments(postId);
        }
    } catch (err) {
        handleAjaxError(err);
    }
}
async function deleteComment(comment) {
    try {
        await remote.remove('appdata', `comments/` + comment._id, 'kinvey');
        let postId = $('#commentForm').attr('data-id');
        showInfo('Comment deleted.');
        showComments(postId);
    }catch (err) {
        handleAjaxError(err);
    }
}


function getArticle(post, rank) {
    let article = $('<article>').addClass('post')
        .append($('<div>').addClass('col rank')
            .append($('<span>').text(rank)))
        .append($('<div>').addClass('col thumbnail')
            .append($('<a>').attr('href', post.url)
                .append($('<img>').attr('src', post.imageUrl))))
        .append($('<div>').addClass('post-content')
            .append($('<div>').addClass('title')
                .append($('<a>').attr('href', post.url).text(post.title)))
            .append($('<div>').addClass('details')
                .append($('<div>').addClass('info')
                    .text(`submitted ${calcTime(post._kmd.ect)} ago by ${post.author}`))
                .append($('<div>').addClass('controls')
                    .append($('<ul>')
                        .append($('<li>').addClass('action')
                            .append($('<a>').addClass('commentsLink').attr('href', '#')
                                .text('comments')).on('click', showComments.bind(this, post._id)))))));
    if (post._acl.creator === sessionStorage.getItem('userId')) {
        article.find('.controls ul')
            .append($('<li>').addClass('action')
                .append($('<a>').addClass('editLink').attr('href', '#')
                    .text('edit')).on('click', showEdit.bind(this, post)))
            .append($('<li>').addClass('action')
                .append($('<a>').addClass('deleteLink').attr('href', '#')
                    .text('delete')).on('click', deletePost.bind(this, post)));
    }
    return article;
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
    catalog();
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