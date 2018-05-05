function attachEvents() {
    const USERNAME = 'peter';
    const PASS = 'p';
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };
    const URL = `https://baas.kinvey.com/appdata/kid_rybFION6G/players/`;
    $('#addPlayer').on('click', addNewPlayer);
    loadInformation();

    function loadInformation() {
        $('#players').empty();
        $('#players').append($('<div>').text('Loading...'));
        $.ajax({
            method: 'GET',
            url: URL,
            headers: authHeaders
        }).then(function (players) {
            $('#players').empty();
            for (let player of players) {
                $('#players')
                    .append($('<div class="player" data-id="<id-goes-here>">')
                        .append($('<div>').addClass('row')
                            .append($('<label>Name:</label>'))
                            .append($(`<label class="name">${player.name}</label>`)))
                        .append($('<div>').addClass('row')
                            .append($('<label>Money:</label>'))
                            .append($(`<label class="money">${player.money}</label>`)))
                        .append($('<div>').addClass('row')
                            .append($('<label>Bullets:</label>'))
                            .append($(`<label class="bullets">${player.bullets}</label>`)))
                        .append($('<button>').addClass('play').text('Play').on('click', function () {
                            $('#save').removeAttr('style');
                            $('#reload').removeAttr('style');
                            $('#canvas').css('display', 'block');
                            loadCanvas(player);
                        }))
                        .append($('<button>').addClass('delete').text('Delete').on('click', function () {
                            $(this).parent().remove();
                            $.ajax({
                                method: 'DELETE',
                                url : URL + player._id,
                                headers: authHeaders
                            }).catch(throwError);
                        })));
            }
        }).catch(throwError);
    }


    function addNewPlayer() {
        let name = $('#addName').val();
        if (name === '')return;
        $.ajax({
            method: 'POST',
            headers: authHeaders,
            url: URL,
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                money: 500,
                bullets: 6
            })
        }).then(() => loadInformation())
            .catch(throwError);
        $('#addName').val('');
    }

    function throwError() {
        console.log('Error');
    }
}
