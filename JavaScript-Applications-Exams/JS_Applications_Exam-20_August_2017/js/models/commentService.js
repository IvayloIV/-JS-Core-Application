let comment = (function () {
    function getAllComments(postId) {
        return remote.get('appdata', `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function createComment(postId, content, author) {
        let data = {postId, content, author};
        return remote.post('appdata', `comments`, 'kinvey', data);
    }
    function deleteComment(commentId) {
        return remote.remove('appdata', `comments/${commentId}`, 'kinvey')
    }
    function getComment(commentId) {
        return remote.get('appdata', `comments/${commentId}`, 'kinvey')
    }
    return {
        getAllComments,
        createComment,
        deleteComment,
        getComment
    }
})();