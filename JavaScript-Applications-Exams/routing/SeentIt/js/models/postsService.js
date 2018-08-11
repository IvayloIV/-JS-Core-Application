let postsService = (() => {
    function getAllPosts() {
        return remote.get('appdata', `posts?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function createPost(author, title, description, url, imageUrl) {
        let data = {author, title, description, url, imageUrl};
        return remote.post('appdata', `posts`, 'kinvey', data);
    }
    function editPost(postId, author, title, description, url, imageUrl) {
        let data = {author, title, description, url, imageUrl};
        return remote.update('appdata', `posts/${postId}`, 'kinvey', data);
    }
    function deletePost(postId) {
        return remote.remove('appdata', `posts/${postId}`, 'kinvey')
    }
    function myPosts(username) {
        return remote.get('appdata', `posts?query={"author":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function postDetails(postId) {
        return remote.get(`appdata`, `posts/${postId}`, 'kinvey');
    }
    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    return {
        getAllPosts,
        createPost,
        editPost,
        deletePost,
        myPosts,
        postDetails,
        calcTime
    };
})();