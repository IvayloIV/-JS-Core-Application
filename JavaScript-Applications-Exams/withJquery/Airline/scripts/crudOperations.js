function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="pass"]').val();

    if (username.length < 5) {
        showError('Too short username!');
    } else if (password === '') {
        showError('Password is empty!');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="pass"]').val();
    let checkPass = $('#formRegister input[name="checkPass"]').val();

    if (username.length < 5) {
        showError('Too short username!');
    } else if (password === '') {
        showError('Password is empty!');
    } else if (checkPass !== password) {
        showError('Passwords does not match!');
    } else {
        remote.post('user', '', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'User registration successful.');
            }).catch(handleAjaxError);
    }
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
}
function logoutUser() {
	remote.post('user', '_logout', 'kinvey')
    .then(function () {
        sessionStorage.clear();
        showLoginView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

async function catalog() {
    try {
        let flights = await remote.get('appdata', `flights?query={"isPublished":"true"}`, 'true');
        let flightsHtml = $('#viewCatalog .added-flights');
        flightsHtml.empty();
        let monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];
        for (let flight of flights) {
            let date = new Date(flight._kmd.ect);
            flightsHtml.append($('<a>').attr('href', '#').addClass('added-flight').on('click', detailsFlight.bind(this, flight._id))
                .append($('<img>').attr('src', flight.image).attr('alt', '').addClass('picture-added-flight'))
                .append($('<h3>').text(flight.destination))
                .append($('<span>').text(`from ${flight.origin}`))
                .append($('<span>').text(`${date.getDate()} ${monthNames[date.getMonth()]}`)));
        }
        showView('viewCatalog');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createFlight() {
    try {
        let destination = $('#formAddFlight input[name="destination"]').val();
        let origin = $('#formAddFlight input[name="origin"]').val();
        let departureDate = $('#formAddFlight input[name="departureDate"]').val();
        let departureTime = $('#formAddFlight input[name="departureTime"]').val();
        let seats = $('#formAddFlight input[name="seats"]').val();
        let cost = $('#formAddFlight input[name="cost"]').val();
        let image = $('#formAddFlight input[name="img"]').val();
        let isPublished = $('#formAddFlight input[name="public"]').is(':checked');

        if (destination === '') {
            showError('Destination is empty!');
        } else if (origin === '') {
            showError('Origin is empty!');
        } else if (isNaN(Number(seats)) || seats.length === 0) {
            showError('Seats must be a number!');
        } else if (isNaN(Number(cost)) || cost.length === 0) {
            showError('Cost must be a number!');
        } else if (Number(seats) < 0) {
            showError('Seats must be a positive number!');
        } else if (Number(cost) < 0) {
            showError('Cost must be a positive number!');
        } else {
            await remote.post('appdata', `flights`, 'kinvey', {
                destination, origin, departureDate, departureTime,
                seats, cost, image, isPublished
            });
            showInfo('Created flight.');
            catalog();
        }
    } catch (err) {
        handleAjaxError(err);
    }
}
async function detailsFlight(flightId) {
    try {
        let flight = await remote.get('appdata', `flights/${flightId}`, 'kinvey');
        let monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];
        let date = new Date(flight._kmd.ect);
        let detailsHtml = $('#viewFlightDetails .ticket-area');
        detailsHtml.find('.ticket-area-left img').attr('src', flight.image);
        detailsHtml.find('.ticket-area-right h3').text(flight.destination);
        detailsHtml.find('.ticket-area-right div:first-of-type').text(`from ${flight.origin}`);
        detailsHtml.find('.ticket-area-right div:nth-of-type(2)').text(`${date.getDate()} ${monthNames[date.getMonth()]} ${date.getHours()}:${date.getMinutes()}`);
        if (flight._acl.creator === sessionStorage.getItem('userId')) {
            detailsHtml.find('.ticket-area-right div:nth-of-type(2)')
                .append($('<a>').attr('href', '#').addClass('edit-flight-detail').on('click', showEditFlight.bind(this, flight)));
        }
        detailsHtml.find('.ticket-area-right div:nth-of-type(3)').text(`${flight.seats} Seats (${flight.cost} per seat)`);
        showView('viewFlightDetails');
    } catch (err) {
        handleAjaxError(err);
    }
}
function showEditFlight(flight) {
    $('#formEditFlight').trigger('reset');
    $('#formEditFlight').attr('data-id', flight._id);
    $('#formEditFlight input[name="destination"]').val(flight.destination);
    $('#formEditFlight input[name="origin"]').val(flight.origin);
    $('#formEditFlight input[name="departureDate"]').val(flight.departureDate);
    $('#formEditFlight input[name="departureTime"]').val(flight.departureTime);
    $('#formEditFlight input[name="seats"]').val(Number(flight.seats));
    $('#formEditFlight input[name="cost"]').val(Number(flight.cost));
    $('#formEditFlight input[name="img"]').val(flight.image);
    if (flight.isPublished === 'true') {
        $('#formEditFlight input[name="public"]').attr('checked', true);
    } else {
        $('#formEditFlight input[name="public"]').attr('checked', false);
    }
   showView('viewEditFlight');
}
async function editFlight() {
    try {
        let destination = $('#formEditFlight input[name="destination"]').val();
        let origin = $('#formEditFlight input[name="origin"]').val();
        let departureDate = $('#formEditFlight input[name="departureDate"]').val();
        let departureTime = $('#formEditFlight input[name="departureTime"]').val();
        let seats = $('#formEditFlight input[name="seats"]').val();
        let cost = $('#formEditFlight input[name="cost"]').val();
        let image = $('#formEditFlight input[name="img"]').val();
        let isPublished = $('#formEditFlight input[name="public"]').is(':checked');
        let flightId = $('#formEditFlight').attr('data-id');

        if (destination === '') {
            showError('Destination is empty!');
        } else if (origin === '') {
            showError('Origin is empty!');
        } else if (isNaN(Number(seats)) || seats.length === 0) {
            showError('Seats must be a number!');
        } else if (isNaN(Number(cost)) || cost.length === 0) {
            showError('Cost must be a number!');
        } else if (Number(seats) < 0) {
            showError('Seats must be a positive number!');
        } else if (Number(cost) < 0) {
            showError('Cost must be a positive number!');
        } else {
            await remote.update('appdata', `flights/` + flightId, 'kinvey', {
                destination, origin, departureDate, departureTime,
                seats, cost, image, isPublished
            });
            showInfo('Successfully edited flight.');
            detailsFlight(flightId);
        }
    } catch (err) {
        handleAjaxError(err);
    }
}

async function myFlight() {
    try {
        let userId = sessionStorage.getItem('userId');
        let flights = await remote.get('appdata', `flights?query={"_acl.creator":"${userId}"}`, 'kinvey');
        let flightsHtml = $('#viewMyFlights');
        flightsHtml.find('.flight-ticket').remove();
        let monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];
        for (let flight of flights) {
            let date = new Date(flight._kmd.ect);
            flightsHtml.append($('<div>').addClass('flight-ticket')
                .append($('<div>').addClass('flight-left')
                    .append($('<img>').attr('src', flight.image).attr('alt', '')))
                .append($('<div>').addClass('flight-right')
                    .append($('<div>')
                        .append($('<h3>').text(flight.destination))
                        .append($('<span>').text(`${date.getDate()} ${monthNames[date.getMonth()]}`)))
                    .append($('<div>').text(`from ${flight.origin}`)
                        .append($('<span>').text(`${date.departureTime}`)))
                    .append($('<p>').text(`${flight.seats} Seats (${flight.cost}$ per seat)`))
                    .append($('<a>').attr('href', '#').addClass('remove').text('REMOVE').on('click', removeFlight.bind(this, flight._id)))
                    .append($('<a>').attr('href', '#').addClass('details').text('Details').on('click', detailsFlight.bind(this, flight._id)))));
        }
        showView('viewMyFlights');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function removeFlight(flightId) {
    try {
        await remote.remove('appdata', `flights/${flightId}`, 'kinvey');
        showInfo('Flight deleted.');
        myFlight();
    } catch (err) {
        handleAjaxError(err);
    }
}


function signInUser(res, message) {
    saveAuthInSession(res);
    catalog();
    showHideMenuLinks();
    showInfo(message);
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}