handlers.commentsGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    let username = sessionStorage.getItem('username');
    let postId = this.params.postId;
    Promise.all([post.detailsPost(postId), comment.getAllComments(postId)])
        .then(function ([myPost, allComments]) {
            myPost.date = post.calcTime(myPost._kmd.ect);
            myPost.isOwner = sessionStorage.getItem('userId') === myPost._acl.creator;
            for (let currentComment of allComments) {
                currentComment.data = post.calcTime(currentComment._kmd.ect);
                currentComment.isOwner = sessionStorage.getItem('userId') === currentComment._acl.creator;
            }
            ctx.totalPost = myPost;
            ctx.comments = allComments;
            ctx.username= username;
            ctx.isAuth = sessionStorage.getItem('authtoken');
            ctx.loadPartials({
                header : './templates/common/header.hbs',
                footer : './templates/common/footer.hbs',
                navigation : './templates/common/navigation.hbs',
                postDetails : './templates/viewComments/postDetails.hbs',
                createCommentForm : './templates/viewComments/createCommentForm.hbs',
                comments : './templates/viewComments/comments.hbs',
            }).then(function () {
                ctx.partials = this.partials;
                ctx.partial('./templates/viewComments/indexViewComments.hbs');
            });
        }).catch(notify.handleError);
};