const handlers = {};
$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index', handlers.index);
        this.post('#/register', handlers.registerPost);
        this.post('#/login', handlers.loginPost);
        this.get('#/logout', handlers.logoutPost);

        this.get('#/home', handlers.homeGet);

        this.get('#/createPost', handlers.createPostGet);
        this.post('#/createPost', handlers.createPostM);

        this.get('#/editPost/:idPost', handlers.editPostGet);
        this.post('#/editPost/:idPost', handlers.editPostM);

        this.get('#/deletePost/:idPost', handlers.deletePostGet);

        this.get('#/myPosts', handlers.myPostsGet);

        this.get('#/viewComments/:postId', handlers.commentsGet);
        this.post('#/createComment', handlers.createCommentPost);
        this.get('#/deleteComment/:commentId', handlers.deleteCommentGet);
    });
    app.run();
});