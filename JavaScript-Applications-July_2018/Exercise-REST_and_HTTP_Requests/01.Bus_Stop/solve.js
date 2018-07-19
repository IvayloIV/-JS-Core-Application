function getInfo() {
    let stopId = $('#stopId').val();
    let url = `https://judgetests.firebaseio.com/businfo/${stopId}.json`;
    let stopName = $('#stopName');
    let buses = $('#buses');
    buses.empty();

    $.ajax({
        method: 'GET',
        url
    }).then(showData)
        .catch(handleError);

    function showData(data) {
        stopName.text(data.name);
        for (let el of Object.entries(data.buses)) {
            buses.append($('<li>').text(`Bus ${el[0]} arrives in ${el[1]} minutes`));
        }
    }

    function handleError() {
        stopName.text('Error');
    }
}