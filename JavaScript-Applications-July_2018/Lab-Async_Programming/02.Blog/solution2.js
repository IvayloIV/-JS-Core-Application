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

    async function loadPosts() {
        posts.empty();
        try{
            let allPosts = await $.ajax({
                method: 'GET',
                url: URL + '/posts',
                headers: HEADER
            });
            for (let post of allPosts) {
                posts.append($('<option>').attr('value', post._id).text(post.title));
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function viewPost() {
        let idPost = posts.find(':selected').attr('value');
        let getPost = $.ajax({
            method: 'GET',
            url: URL + `/posts/${idPost}`,
            headers: HEADER
        });
        let getComments = $.ajax({
            method: 'GET',
            url: URL + `/comme123nts/?query={"post_id":"${idPost}"}`,
            headers: HEADER
        });

        try {
            let [currentPost, allComments] = await Promise.all([getPost, getComments]);
            comments.empty();
            postTitle.text(currentPost.title);
            postBody.text(currentPost.body);
            for (let comment of allComments) {
                comments.append($('<li>').text(comment.text));
            }
        } catch (err) {
            console.log(err);
        }
    }
}