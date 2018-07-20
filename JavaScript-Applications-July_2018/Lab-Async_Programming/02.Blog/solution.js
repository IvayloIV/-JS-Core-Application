function attachEvents() {
    const URL = `https://baas.kinvey.com/appdata/kid_ByFlKnJNQ`;
    const USERNAME = 'pesho';
    const PASSSWORD = '123';
    const BASE_64 = btoa(USERNAME + ':' + PASSSWORD);
    const HEADER = {'Authorization' : 'Basic ' + BASE_64};
    let posts = $('#posts');
    let comments = $('#post-comments');
    let postTitle = $('#post-title');
    let postBody = $('#post-body');

    $('#btnLoadPosts').on('click', loadPosts);
    $('#btnViewPost').on('click', viewPost);

    function loadPosts() {
        posts.empty();
        $.ajax({
            method: 'GET',
            url: URL + '/posts',
            headers: HEADER
        }).then(function (allPosts) {
            for (let post of allPosts) {
                posts.append($('<option>').attr('value', post._id).text(post.title));
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    function viewPost() {
        let idPost = posts.find(':selected').attr('value');
        let getPost = $.ajax({
            method: 'GET',
            url: URL + `/posts/${idPost}`,
            headers: HEADER
        });
        let getComments = $.ajax({
            method: 'GET',
            url: URL + `/comments/?query={"post_id":"${idPost}"}`,
            headers: HEADER
        });
        Promise.all([getPost, getComments])
            .then(function ([currentPost, allComments]) {
                comments.empty();
                postTitle.text(currentPost.title);
                postBody.text(currentPost.body);
                for (let comment of allComments) {
                    comments.append($('<li>').text(comment.text));
                }
            })
            .catch(function (err) {
                console.log(err);
            })
    }
}