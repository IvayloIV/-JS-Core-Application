let flightsService = (function () {
    function getPublishedFlights() {
        return remote.get('appdata', `flights?query={"isPublished":"true"}`, 'kinvey');
    }
    function createFlight(destination, origin, departureDate, departureTime, seats, cost, image, isPublished) {
        let data = {
            destination,
            origin,
            departureDate,
            departureTime,
            seats: Number(seats),
            cost: Number(cost),
            image,
            isPublished
        };
        return remote.post('appdata', `flights`, 'kinvey', data);
    }
    function editFlight(flightId, data) {
        return remote.update('appdata', `flights/${flightId}`, 'kinvey', data);
    }
    function deleteFlight(flightId) {
        return remote.remove('appdata', `flights/${flightId}`, 'kinvey')
    }
    function detailsFlight(flightId) {
        return remote.get('appdata', `flights/${flightId}`, 'kinvey');
    }
    function myFlight(userId) {
        return remote.get('appdata', `flights?query={"_acl.creator":"${userId}"}`, 'kinvey');
    }

    return {
        getPublishedFlights,
        createFlight,
        editFlight,
        deleteFlight,
        detailsFlight,
        myFlight
    }
})();