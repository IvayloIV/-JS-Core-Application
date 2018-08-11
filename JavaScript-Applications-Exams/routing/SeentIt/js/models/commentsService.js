let commentsService = (() => {
    function getCommentsByPostId(postId) {
        return remote.get(`appdata`, `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function createComment(postId, content) {
        let data = {postId, content, author: sessionStorage.getItem('username')};
        return remote.post('appdata', `comments`, 'kinvey', data);
    }
    function deleteComment(commentId) {
        return remote.remove('appdata', `comments/${commentId}`, 'kinvey');
    }
    return {
        getCommentsByPostId,
        createComment,
        deleteComment
    };
})();