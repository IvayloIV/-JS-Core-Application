function loadCommits() {
    let username = $('#username').val();
    let repo = $('#repo').val();
    $('#commits').empty();
    $.ajax({
        method: 'GET',
        url: `https://api.github.com/repos/${username}/${repo}/commits`,
    }).then(function (result) {
        for (let resultElement of result) {
            $('#commits').append($('<li>').text(`${resultElement.commit.author.name}: ${resultElement.commit.message}`));
        }
    }).catch(function (error) {
        $('#commits').append($('<li>').text(`Error: ${error.status} (${error.statusText})`));
    });
}