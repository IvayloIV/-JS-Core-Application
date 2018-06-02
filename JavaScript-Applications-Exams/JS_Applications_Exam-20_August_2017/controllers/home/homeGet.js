handlers.homeGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    post.getAllPosts()
        .then(function (posts) {
            let count = 1;
            for (let currentPost of posts) {
                currentPost.rank = count++;
                currentPost.date = post.calcTime(currentPost._kmd.ect);
                currentPost.isOwner = sessionStorage.getItem('userId') === currentPost._acl.creator;
            }
            ctx.articles = posts;
            ctx.username= sessionStorage.getItem('username');
            ctx.isAuth = sessionStorage.getItem('authtoken');
            ctx.loadPartials({
                header : './templates/common/header.hbs',
                footer : './templates/common/footer.hbs',
                navigation : './templates/common/navigation.hbs',
                articlePosts : './templates/catalog/articlePosts.hbs'
            }).then(function () {
                ctx.partials = this.partials;
                ctx.partial('./templates/catalog/indexCatalog.hbs');
            });
        })
        .catch(notify.handleError);
};