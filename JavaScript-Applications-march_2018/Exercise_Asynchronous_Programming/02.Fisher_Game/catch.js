function attachEvents() {
    $('.load').on('click', loadInformation);
    $('.add').on('click', addNewGame);
    const URL = `https://baas.kinvey.com/appdata/kid_H1uhlrGpz/biggestCatches`;
    const USERNAME = 'peter';
    const PASS = 'p';
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };

    function loadInformation() {
        $('#catches').empty();
        $('#catches').append($('<div>').text('Loading...'));
        $.ajax({
            method: 'GET',
            url: URL,
            headers: authHeaders
        }).then(function (labels) {
            $('#catches').empty();
            for (let label of labels) {
                $('#catches')
                    .append($('<div>').addClass('catch').attr('data-id', label._id)
                        .append($('<label>').text('Angler'))
                        .append($('<input>').addClass('angler').attr('type', 'text').val(label.angler))
                        .append($('<label>').text('Weight'))
                        .append($('<input>').addClass('weight').attr('type', 'number').val(label.weight))
                        .append($('<label>').text('Species'))
                        .append($('<input>').addClass('species').attr('type', 'text').val(label.species))
                        .append($('<label>').text('Location'))
                        .append($('<input>').addClass('location').attr('type', 'text').val(label.location))
                        .append($('<label>').text('Bait'))
                        .append($('<input>').addClass('bait').attr('type', 'text').val(label.bait))
                        .append($('<label>').text('Capture Time'))
                        .append($('<input>').addClass('captureTime').attr('type', 'number').val(label.captureTime))
                        .append($('<button>').addClass('update').text('Update').on('click', updateGame.bind(this, label._id)))
                        .append($('<button>').addClass('delete').text('Delete').on('click', removeGame.bind(this, label._id))));
            }
        }).catch(throwError);

        function updateGame(id) {
            $.ajax({
                method: 'PUT',
                url: URL + `/${id}`,
                data: JSON.stringify({
                    angler: $(`#catches [data-id*='${id}'] .angler`).val(),
                    weight: Number($(`#catches [data-id*='${id}'] .weight`).val()),
                    species: $(`#catches [data-id*='${id}'] .species`).val(),
                    location: $(`#catches [data-id*='${id}'] .location`).val(),
                    bait: $(`#catches [data-id*='${id}'] .bait`).val(),
                    captureTime: Number($(`#catches [data-id*='${id}'] .captureTime`).val())
                }),
                headers: authHeaders,
                contentType: 'application/json'
            }).then(function () {
                loadInformation();
            }).catch(throwError);
        }
        function removeGame(id) {
            $.ajax({
                method: 'DELETE',
                url: URL + `/${id}`,
                headers: authHeaders
            }).then(function () {
                loadInformation();
            }).catch(throwError);
        }
    }
    function addNewGame() {
        $.ajax({
            method: "POST",
            url: URL,
            data: JSON.stringify({
                angler: $("#addForm .angler").val(),
                weight: Number($("#addForm .weight").val()),
                species: $("#addForm .species").val(),
                location: $("#addForm .location").val(),
                bait: $("#addForm .bait").val(),
                captureTime: Number($("#addForm .captureTime").val())
            }),
            headers: authHeaders,
            contentType: 'application/json'
        })
            .then(() => loadInformation())
            .catch(throwError);
    }
    function throwError() {
        console.log('Error');
    }
}