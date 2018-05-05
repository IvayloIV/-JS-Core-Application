function attachEvents() {
    const USERNAME = 'peter';
    const PASS = 'p';
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };
    const URLcountries = 'https://baas.kinvey.com/appdata/kid_SyTgmQmpz/countries/';
    const URLtowns = 'https://baas.kinvey.com/appdata/kid_SyTgmQmpz/towns/';
    $('#load').on('click', loadContries);
    $('#createCountry').on('click', createCountry);
    $('#country').on('change', loadTowns);
    $('#createTown').on('click', createTown);
    let countriesId = {};

    function createTown() {
        let currentTownName = $('#townName').val();
        if (currentTownName === '') return;
        let currentContry = $('#country option:selected').val();
        $.ajax({
            method: 'POST',
            url: URLtowns,
            headers: authHeaders,
            contentType: 'application/json',
            data: JSON.stringify({id : countriesId[currentContry], townName : currentTownName})
        }).then(function () {
            loadTowns();
        })
            .catch(throwError);
        $('#townName').val('');
    }

    async function loadContries() {
        $('#country').empty();
        await getAllContries().then(function (countries) {
            for (let country of countries) {
                $('#country').append($('<option>').text(country.name));
                countriesId[country.name] = country._id;
            }
        }).catch(throwError);
        await $('#delete').removeAttr('style').on('click', function () {
            let contryName = $('#country option:selected').text();
            $.ajax({
                method: 'DELETE',
                url: URLcountries + countriesId[contryName],
                headers:authHeaders
            }).then(() => loadContries()).catch(throwError);
        });
        loadTowns();
    }

    async function getAllContries() {
        return $.ajax({
            method: 'GET',
            url: URLcountries,
            headers: authHeaders
        });
    }

    async function createCountry() {
        let name = $('#name').val();
        if (name === '') return;
        await $.ajax({
            method: 'POST',
            url: URLcountries,
            headers: authHeaders,
            contentType: 'application/json',
            data: JSON.stringify({name})
        }).then(function () {
            loadContries();
        }).catch(throwError);
        $('#name').val('');
    }

    function loadTowns() {
        $('#towns').empty();
        $('#towns').text('Loading...');
        $.ajax({
            method:'GET',
            url: URLtowns,
            headers: authHeaders,
        }).then(function (towns) {
            let currentCountry = $('#country option:selected').text();
            let isEmpty = true;
            $('#towns').empty();
            for (let town of towns) {
                if (town.id === countriesId[currentCountry]){
                    $('#towns').append($('<li>').text(town.townName + ' ')
                        .append($('<button>').text('Delete').on('click', function () {
                            $.ajax({
                                method: 'DELETE',
                                url: URLtowns + town._id,
                                headers: authHeaders
                            }).then(function () {
                                loadTowns();
                            }).catch(throwError);
                        })));
                    isEmpty = false;
                }
            }
            if (isEmpty){
                $('#towns').append($('<li>').text('(empty)'));
            }
        }).catch(throwError);
        $('#allTowns').removeAttr('style');
    }

    function throwError() {
        console.log('Error');
    }
}