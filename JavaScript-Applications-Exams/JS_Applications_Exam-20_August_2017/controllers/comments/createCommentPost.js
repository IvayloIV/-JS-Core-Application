handlers.createCommentPost = function (ctx) {
    let content = this.params.content;
    let author = sessionStorage.getItem('username');
    let postId = this.params.postId;
    if (content === ''){
        notify.showError('Content is empty.');
    } else {
        comment.createComment(postId, content, author)
            .then(function () {
                ctx.partials = this.partials;
                ctx.redirect(`#/viewComments/${postId}`);
                notify.showInfo('Comment created.');
            }).catch(notify.handleError);
    }
};