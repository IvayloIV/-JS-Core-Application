handlers.createPostM = function (ctx) {
    let url = this.params.url;
    let title = this.params.title;
    let image = this.params.image;
    let comment = this.params.comment;
    let author = sessionStorage.getItem('username');
    if (url === '' || title === ''){
        notify.showError('Empty url or title.');
    } else if (!url.startsWith('http')){
        notify.showError('Invalid url.');
    } else {
        post.createPost(author, title, comment, url, image)
            .then(function () {
                ctx.partials = this.partials;
                ctx.redirect('#/home');
                notify.showInfo('Post created.');
            }).catch(notify.handleError);
    }
};