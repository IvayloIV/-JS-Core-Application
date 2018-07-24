function attachEvents() {
    const URL = `https://baas.kinvey.com/appdata/kid_H1uhlrGpz/`;
    const USERNAME = 'peter';
    const PASSWORDS = 'p';
    const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
    const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
    let catches = $('#catches');

    let angler = $('#addForm .angler');
    let weight = $('#addForm .weight');
    let species = $('#addForm .species');
    let location = $('#addForm .location');
    let bait = $('#addForm .bait');
    let captureTime = $('#addForm .captureTime');

    $('.load').on('click', loadInformation);
    $('.add').on('click', createCatch);

    async function createCatch() {
        let data;
        try {
            data = await $.ajax({
                method: 'POST',
                url: URL + 'biggestCatches',
                headers: AUTORIZATION,
                data: JSON.stringify({
                    angler: angler.val(),
                    weight: Number(weight.val()),
                    species: species.val(),
                    location: location.val(),
                    bait: bait.val(),
                    captureTime: Number(captureTime.val())
                }),
                contentType: 'application/json'
            });
        }catch (e) {
            console.log('Error');
            return;
        }
        angler.val('');
        weight.val('');
        species.val('');
        location.val('');
        bait.val('');
        captureTime.val('');
        catches.append(createHtmlArticle(data));
    }

    async function loadInformation() {
        catches.empty();
        catches.text('Loading...');
        let allCatches;
        try {
            allCatches = await $.ajax({
                method: 'GET',
                url: URL + 'biggestCatches',
                headers: AUTORIZATION
            });
        }catch (e) {
            console.log('Error');
            return;
        }
        catches.empty();
        for (let allCatch of allCatches) {
            catches.append(createHtmlArticle(allCatch));
        }
    }

    async function deleteCatch() {
        let item = $(this).parent();
        try {
            await $.ajax({
                method: 'DELETE',
                url: URL + 'biggestCatches/' + item.attr('data-id'),
                headers: AUTORIZATION
            });
        }catch (e) {
            console.log('Error');
            return;
        }
        item.remove();
    }
    
    async function updateCatch() {
        let item = $(this).parent();
        try {
            await $.ajax({
                method: 'PUT',
                url: URL + 'biggestCatches/' + item.attr('data-id'),
                headers: AUTORIZATION,
                data: JSON.stringify({
                    angler: item.find('.angler').val(),
                    weight: Number(item.find('.weight').val()),
                    species: item.find('.species').val(),
                    location: item.find('.location').val(),
                    bait: item.find('.bait').val(),
                    captureTime: Number(item.find('.captureTime').val())
                }),
                contentType: 'application/json'
            });
        }catch (e) {
            console.log('Error');
        }
    }

    function createHtmlArticle(allCatch) {
        return $('<div>').addClass('catch').attr('data-id', allCatch._id)
            .append($('<label>').text('Angler'))
            .append($('<input>').attr('type', 'text').addClass('angler').val(allCatch.angler))
            .append($('<label>').text('Weight'))
            .append($('<input>').attr('type', 'number').addClass('weight').val(allCatch.weight))
            .append($('<label>').text('Species'))
            .append($('<input>').attr('type', 'text').addClass('species').val(allCatch.species))
            .append($('<label>').text('Location'))
            .append($('<input>').attr('type', 'text').addClass('location').val(allCatch.location))
            .append($('<label>').text('Bait'))
            .append($('<input>').attr('type', 'text').addClass('bait').val(allCatch.bait))
            .append($('<label>').text('Capture Time'))
            .append($('<input>').attr('type', 'number').addClass('captureTime').val(allCatch.captureTime))
            .append($('<button>').addClass('update').text('Update').on('click', updateCatch))
            .append($('<button>').addClass('delete').text('Delete').on('click', deleteCatch));
    }
}