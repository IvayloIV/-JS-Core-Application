handlers.deletePostGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    let idPost = this.params.idPost;
    post.deletePost(idPost)
        .then(function () {
            ctx.partials = this.partials;
            ctx.redirect('#/home');
            notify.showInfo('Post deleted.');
        })
        .catch(notify.handleError);
};