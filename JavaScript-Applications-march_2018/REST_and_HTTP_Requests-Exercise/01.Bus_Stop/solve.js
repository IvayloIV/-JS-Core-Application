function getInfo() {
    $('#buses').empty();
    $.ajax({
        method: 'GET',
        url: `https://judgetests.firebaseio.com/businfo/${$('#stopId').val()}.json`,
        success: printResult,
        error: throwError
    });
    function printResult(repos) {
        $('#stopName').text(repos.name);
        for (let repo of Object.entries(repos['buses'])) {
            $('#buses').append($('<li>').text(`Bus ${repo[0]} arrives in ${repo[1]} minutes`));
        }
    }
    function throwError() {
        $('#stopName').text('Error');
    }
}