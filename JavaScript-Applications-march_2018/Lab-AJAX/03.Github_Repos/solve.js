function loadRepos() {
    $('#repos').empty();
    let name = $('#username').val();
    $.ajax({
        method: 'GET',
        url : 'https://api.github.com/users/' + name + '/repos',
        success: showInformation,
        error: throwError
    });
    
    function showInformation(repos) {
        for (let repo of Object.entries(repos)) {
            $('#repos').append($('<li>')
                .append($('<a>').attr('href', repo[1].html_url).text(repo[1].full_name)));
        }
    }
    
    function throwError() {
        $('#repos').append($('<li>').text('Error'));
    }
}