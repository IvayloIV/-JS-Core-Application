function attachEvents() {
    let url = `https://baas.kinvey.com/`;
    const USERNAME = 'guest';
    const PASSWORDS = 'pass';
    const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
    const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
    let venueDateInput = $('#venueDate');
    let venueInfo = $('#venue-info');
    $('#getVenues').on('click', showCalendar);

    function showCalendar() {
        $.ajax({
            method: 'POST',
            url: url + `rpc/kid_BJ_Ke8hZg/custom/calendar?query=${venueDateInput.val()}`,
            headers: AUTORIZATION
        }).then(function (venues) {
            venueInfo.empty();
            for (let venue of venues) {
                $.ajax({
                    method: 'GET',
                    url: url + `appdata/kid_BJ_Ke8hZg/venues/${venue}`,
                    headers: AUTORIZATION
                }).then(function (data) {
                    venueInfo.append($('<div>').addClass('venue').attr('id', data._id)
                        .append($('<span>').addClass('venue-name')
                            .append($('<input>').addClass('info').attr('type', 'button').attr('value', 'More info').on('click',function () {
                                let item = $(this).parent().parent().find('.venue-details');
                                if (item.css('display') === 'none') {
                                    item.css('display', 'block');
                                } else {
                                    item.css('display', 'none');
                                }
                            }))
                            .append(data.name))
                        .append($('<div>').addClass('venue-details').css('display', 'none')
                            .append($('<table>')
                                .append($('<tr>')
                                    .append($('<th>').text('Ticket Price'))
                                    .append($('<th>').text('Quantity'))
                                    .append($('<th>')))
                                .append($('<td>').addClass('venue-price').text(Number(data.price).toFixed(2) + ' lv'))
                                .append($('<td>')
                                    .append($('<select>').addClass('quantity')
                                        .append($('<option>').val('1').text('1'))
                                        .append($('<option>').val('2').text('2'))
                                        .append($('<option>').val('3').text('3'))
                                        .append($('<option>').val('4').text('4'))
                                        .append($('<option>').val('5').text('5'))))
                                .append($('<td>')
                                    .append($('<input>').addClass('purchase').attr('type', 'button').val('Purchase').on('click', function () {
                                        venueInfo.empty();
                                        let qty = Number($(this).parent().parent().find('.quantity option:selected').val());
                                        venueInfo.append($('<span>').addClass('head').text('Confirm purchase'))
                                            .append($('<div>').addClass('purchase-info')
                                                .append($('<span>').text(data.name))
                                                .append($('<span>').text(qty + ' x ' + Number(data.price).toFixed(2)))
                                                .append($('<span>').text('Total: ' + (qty * Number(data.price)).toFixed(2) + ' lv'))
                                                .append($('<input>').attr('type', 'button').attr('value', 'Confirm').on('click', confirmProduct.bind(this, data._id, qty))));
                                    }))))
                            .append($('<span>').addClass('head').text('Venue description:'))
                            .append($('<p>').addClass('description').text(data.description))
                            .append($('<p>').addClass('description').text(`Starting time: ${data.startingHour}`))));
                }).catch(handleError);
            }
        }).catch(handleError);
    }

    function confirmProduct(id, qty) {
        $.ajax({
            method: 'POST',
            url: url + `rpc/kid_BJ_Ke8hZg/custom/purchase?venue=${id}&qty=${qty}`,
            headers: AUTORIZATION
        }).then(function (data) {
            venueInfo.empty();
            venueInfo.append('You may print this page as your ticket')
                .append(data.html);
        }).catch(handleError);
    }

    function handleError() {
        venueInfo.text('Error');
    }
}