function attachEvents() {
    let URL = `https://baas.kinvey.com/appdata/kid_rJ9EBUV4m`;
    const USERNAME = 'peter';
    const PASSWORDS = 'p';
    const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
    const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
    let players = $('#players');
    let newPlayerInput = $('#addName');

    loadPlayers();
    $('#addPlayer').on('click', addPlayer);
    $('#save').on('click', saveData);

    function saveData() {
        $.ajax({
            method: 'PUT',
            url: URL + '/players/' + $('#save').attr('data-id'),
            headers: AUTORIZATION,
            data: JSON.stringify(canvas.player),
            contentType: 'application/json'
        }).then(function () {
            loadPlayers();
            clearInterval(canvas.intervalId);
            loadCanvas(canvas.player);
        }).catch(handleError);
    }

    function addPlayer() {
        $.ajax({
            method: 'POST',
            url: URL + '/players',
            headers: AUTORIZATION,
            data: JSON.stringify({
                name: newPlayerInput.val(),
                money: 500,
                bullets: 6
            }),
            contentType: 'application/json'
        }).then(function (newPly) {
            players.append(creteHtmlPlayer(newPly));
            newPlayerInput.val('');
        }).catch(handleError);
    }

    function loadPlayers() {
        players.empty();
        players.text('Loading...');
        $.ajax({
            method: 'GET',
            url: URL + '/players',
            headers: AUTORIZATION
        }).then(function (data) {
            players.empty();
            for (let el of data) {
                players.append(creteHtmlPlayer(el));
            }
        }).catch(handleError);
    }

    function creteHtmlPlayer(el) {
        return $('<div>').addClass('player').attr('data-id', el._id)
            .append($('<div>').addClass('row')
                .append($('<label>').text('Name:'))
                .append($('<label>').addClass('name').text(el.name)))
            .append($('<div>').addClass('row')
                .append($('<label>').text('Money:'))
                .append($('<label>').addClass('money').text(el.money)))
            .append($('<div>').addClass('row')
                .append($('<label>').text('Bullets:'))
                .append($('<label>').addClass('bullets').text(el.bullets)))
            .append($('<button>').addClass('play').text('Play').on('click', function () {
                clearInterval(canvas.intervalId);
                $('#save').css('display', '');
                $('#save').attr('data-id', el._id);
                $('#reload').css('display', '');
                $('#canvas').css('display', '');
                $('#reload').off('click');
                $('#reload').on('click', function () {
                    let totalMoney = Math.max(0,  Number(canvas.player.money) - 60);
                    let newData = {
                        name: canvas.player.name,
                        money: totalMoney,
                        bullets: 6,
                    };
                    $.ajax({
                        method:'PUT',
                        url: URL + '/players/' + el._id,
                        headers: AUTORIZATION,
                        data: JSON.stringify(newData),
                        contentType: 'application/json'
                    }).then(function () {
                        loadPlayers();
                        clearInterval(canvas.intervalId);
                        loadCanvas(newData);
                    })
                        .catch(handleError);
                });
                loadCanvas({
                    name: el.name,
                    money: el.money,
                    bullets: el.bullets
                });
            }))
            .append($('<button>').addClass('delete').text('Delete').on('click', function () {
                $.ajax({
                    method: 'DELETE',
                    url: URL + '/players/' + el._id,
                    headers: AUTORIZATION
                }).then(() => {
					$('#save').css('display', 'none');
					$('#reload').css('display', 'none');
					$('#canvas').css('display', 'none');
                    $(this).parent().remove();
                }).catch(handleError);
            }));
    }

    function handleError(err) {
        console.log('Error');
    }
}