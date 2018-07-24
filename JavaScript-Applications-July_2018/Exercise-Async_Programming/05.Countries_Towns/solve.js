function attachEvents() {
    const URL = `https://baas.kinvey.com/appdata/kid_H1-hwomNX/`;
    const USERNAME = 'peter';
    const PASSWORDS = 'p';
    const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
    const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
    let countrySection = $('#country');
    let allTowns = $('#allTowns');
    let countryInput = $('#name');
    let totalTowns = $('#towns');
    let townNameInput = $('#townName');

    $('#load').on('click', loadCountry);
    $('#delete').on('click', deleteCountry);
    $('#createCountry').on('click', createCountry);
    countrySection.on('change', loadTowns);
    $('#createTown').on('click', createTown);

    function loadCountry() {
        $.ajax({
            method: 'GET',
            url: URL + 'country',
            headers: AUTORIZATION
        }).then(function (allCountry) {
            countrySection.empty();
            for (let currentCountry of allCountry) {
                countrySection.append($('<option>').val(currentCountry._id).text(currentCountry.name));
            }
            $('#delete').css('display', '');
            allTowns.css('display', '');
            loadTowns();
        }).catch(handleError);
    }

    function deleteCountry() {
        let idCountry = countrySection.find('option:selected').val();
        $.ajax({
            method: 'DELETE',
            url: URL + 'country/' + idCountry,
            headers: AUTORIZATION
        }).then(function () {
            loadCountry();
            loadTowns();
        }).catch(handleError);
    }
    function createCountry() {
        $.ajax({
            method: 'POST',
            url: URL + 'country',
            headers: AUTORIZATION,
            data: JSON.stringify({
                name: countryInput.val()
            }),
            contentType: 'application/json'
        }).then(function (country) {
            countrySection.append($('<option>').val(country._id).text(country.name));
            countryInput.val('');
            $('#delete').css('display', '');
            allTowns.css('display', '');
        }).catch(handleError);
    }
    function loadTowns() {
        totalTowns.empty();
        totalTowns.text('Loading...');
        $.ajax({
            method: 'GET',
            url: URL + 'towns',
            headers: AUTORIZATION
        }).then(function (allTowns) {
            let countryId = countrySection.find('option:selected').val();
            totalTowns.empty();
            let isEmpty = true;
            for (let currentTown of allTowns) {
                if (currentTown.id === countryId) {
                    isEmpty = false;
                    totalTowns.append($('<li>').text(currentTown.name + ' ')
                        .append($('<button>').text('Delete').on('click', function () {
                            $.ajax({
                                method: 'DELETE',
                                url: URL + 'towns/' + currentTown._id,
                                headers: AUTORIZATION
                            }).then(() => {
                                loadTowns();
                            }).catch(handleError);
                        })));
                }
            }
            if (isEmpty) {
                totalTowns.append($('<li>').text('(empty)'));
            }
        }).catch(handleError);
    }
    function createTown() {
        $.ajax({
            method: 'POST',
            url: URL + 'towns',
            headers: AUTORIZATION,
            data: JSON.stringify({
                name: townNameInput.val(),
                id: countrySection.find('option:selected').val()
            }),
            contentType: 'application/json'
        }).then(function (newTown) {
            loadTowns();
            townNameInput.val('');
        }).catch(handleError);
    }

    function handleError() {
        console.log('Error');
    }
}