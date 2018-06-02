handlers.editPostGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    let idPost = this.params.idPost;
    this.isAuth = sessionStorage.getItem('authtoken');
    this.username = sessionStorage.getItem('username');
    post.detailsPost(idPost)
        .then(function (currentPost) {
            ctx.currentPost = currentPost;
            ctx.loadPartials({
                header : './templates/common/header.hbs',
                footer : './templates/common/footer.hbs',
                navigation : './templates/common/navigation.hbs',
                editForm : './templates/editPost/editForm.hbs'
            }).then(function () {
                ctx.partials = this.partials;
                ctx.partial('./templates/editPost/indexPost.hbs');
            });
        })
        .catch(notify.handleError);
};