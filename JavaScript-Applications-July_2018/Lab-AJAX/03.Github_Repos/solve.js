function loadRepos() {
    let inputValue = $('#username').val();
    let ul = $('#repos');
    ul.empty();
    $.ajax({
        method: 'GET',
        url: `https://api.github.com/users/${inputValue}/repos`,
        success: function (repos) {
            for (let repo of repos) {
                ul.append($('<li>')
                    .append($('<a>').attr('href', repo.html_url).text(repo.full_name)));
            }
        },
        error: function () {
            ul.append($('<li>').text('Error'));
        }
    });
}