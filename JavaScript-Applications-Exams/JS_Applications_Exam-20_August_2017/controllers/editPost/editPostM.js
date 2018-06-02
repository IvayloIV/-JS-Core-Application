handlers.editPostM = function (ctx) {
    let url = this.params.url;
    let title = this.params.title;
    let image = this.params.image;
    let description = this.params.description;
    let author = sessionStorage.getItem('username');
    let data = {
        author,
        title,
        description,
        url,
        imageUrl: image
    };
    let idPost = this.params.idPost;
    if (url === '' || title === ''){
        notify.showError('Empty url or title.');
    } else if (!url.startsWith('http')){
        notify.showError('Invalid url.');
    } else {
        post.editPost(data, idPost)
            .then(function () {
                ctx.partials = this.partials;
                ctx.redirect('#/home');
                notify.showInfo(`Post ${title} updated.`);
            }).catch(notify.handleError);
    }
};