let flightsService = (() => {
    function getFlights() {
        return remote.get(`appdata`, `flights?query={"isPublished":"true"}`, 'kinvey');
    }
    function createFlight(destination, origin, departureDate, departureTime,
                          seats, cost, image, isPublished) {
        let data = {destination, origin, departureDate, departureTime,
            seats, cost, image, isPublished};
        return remote.post('appdata', `flights`, 'kinvey', data);
    }
    function editFlight(flightId, destination, origin, departureDate, departureTime,
                        seats, cost, image, isPublished) {
        let data = {destination, origin, departureDate, departureTime,
            seats, cost, image, isPublished};
        return remote.update('appdata', 'flights/' + flightId, 'kinvey', data);
    }
    function deleteFlight(flightId) {
        return remote.remove('appdata', `flights/${flightId}`, 'kinvey');
    }
    function flightDetails(flightId) {
        return remote.get('appdata', `flights/${flightId}`, 'kinvey');
    }
    function myFlights(userId) {
        return remote.get(`appdata`, `flights?query={"_acl.creator":"${userId}"}`, 'kinvey');
    }

    return {
        getFlights,
        createFlight,
        editFlight,
        deleteFlight,
        flightDetails,
        myFlights
    };
})();