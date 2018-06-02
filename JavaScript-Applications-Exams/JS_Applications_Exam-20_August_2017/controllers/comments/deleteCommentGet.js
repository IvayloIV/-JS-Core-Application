handlers.deleteCommentGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    let commentId = this.params.commentId;
    Promise.all([comment.getComment(commentId), comment.deleteComment(commentId)])
        .then(function ([commentInfo]) {
            ctx.partials = this.partials;
            ctx.redirect(`#/viewComments/${commentInfo.postId}`);
            notify.showInfo('Comment deleted.');
        }).catch(notify.showInfo);
};