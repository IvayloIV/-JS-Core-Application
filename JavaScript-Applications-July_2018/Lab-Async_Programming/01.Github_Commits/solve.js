function loadCommits() {
    let username = $('#username').val();
    let repoName = $('#repo').val();
    let commits = $('#commits');
    commits.empty();
    let url = `https://api.github.com/repos/${username}/${repoName}/commits`;
    $.ajax({
        method: 'GET',
        url
    }).then(function (repos) {
        for (let repo of repos) {
            commits.append($('<li>').text(`${repo.commit.author.name}: ${repo.commit.message}`));
        }
    }).catch(function (error) {
        commits.append($('<li>').text(`Error: ${error.status} (${error.statusText})`));
    });
}