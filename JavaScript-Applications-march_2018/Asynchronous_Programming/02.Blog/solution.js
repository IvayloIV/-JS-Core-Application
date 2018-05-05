function attachEvents() {
    const ID = `kid_By5gg5xaf`;
    const USERNAME = 'peter';
    const PASS = 'p';
    const URL = `https://baas.kinvey.com/appdata/${ID}/`;
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };
    let myPosts = {};

    $('#btnLoadPosts').on('click', loadInformation);
    $('#btnViewPost').on('click', viewInformation);

    function loadInformation() {
        $('#posts').empty();
        $.ajax({
            method: 'GET',
            url: URL + 'posts',
            headers: authHeaders
        }).then(function (posts) {
            for (let post of posts) {
                $('#posts').append($('<option>').attr('value', post._id).text(post.title));
                myPosts[post._id] = post.body;
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    
    function viewInformation() {
        let idSelect = $('#posts option:selected').val();
        $('#post-comments').empty();
        $.ajax({
            method: 'GET',
            url: URL + `comments?query={"post_id":"${idSelect}"}`,
            headers: authHeaders
        }).then(function (comments) {
            $('#post-title').text($('#posts option:selected').text());
            $('#post-body').text(myPosts[comments[0].post_id]);
            for (let comment of comments) {
                $('#post-comments').append($('<li>').text(comment.text));
            }
        });
    }
}