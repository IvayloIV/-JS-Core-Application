function attachEvents() {
    const USERNAME = 'guest';
    const PASS = 'pass';
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };
    const URL = `https://baas.kinvey.com/`;

    $('#getVenues').on('click', createVenue);
    
    function createVenue() {
        let text = $('#venueDate').val();
        $('#venue-info').empty();
        $('#venue-info').text('Loading...');
        if (text === '') return;
        $.ajax({
            method: 'POST',
            url : URL + `rpc/kid_BJ_Ke8hZg/custom/calendar?query=${text}`,
            headers: authHeaders,
        }).then(function (ids) {
            $('#venue-info').empty();
            for (let id of ids) {
                $.ajax({
                    method:'GET',
                    url: URL + `appdata/kid_BJ_Ke8hZg/venues/${id}`,
                    headers: authHeaders
                }).then(function (venue) {
                    $('#venue-info')
                        .append($(`<div class="venue" id="${venue._id}"></div>`)
                            .append($(`<span class="venue-name"></span>`)
                                .append($(`<input class="info" type="button" value="More info">`).on('click', details))
                                .append(venue.name))
                            .append($(`<div class="venue-details" style="display: none;"></div>`)
                                .append($(`<table></table>`)
                                    .append($(`<tr><th>Ticket Price</th><th>Quantity</th><th></th></tr>`))
                                    .append($(`<tr></tr>`)
                                        .append($(`<td class="venue-price">${venue.price} lv</td>`))
                                        .append($(`<td>`)
                                            .append($(`<select class="quantity"></select>`)
                                                .append($(`<option value="1">1</option>`))
                                                .append($(`<option value="2">2</option>`))
                                                .append($(`<option value="3">3</option>`))
                                                .append($(`<option value="4">4</option>`))
                                                .append($(`<option value="5">5</option>`))))
                                        .append($(`<td></td>`)
                                            .append($(`<input class="purchase" type="button" value="Purchase">`).on('click', loadConfirmationPage)))))
                                .append($(`<span class="head">Venue description:</span>`))
                                .append($(`<p class="description">${venue.description}</p>`))
                                .append($(`<p class="description">Starting time: ${venue.startingHour}</p>`))))
                }).catch(throwError);
            }
        }).catch(throwError);
    }

    function loadConfirmationPage() {
        let venueInfo = $(this).parent().parent().parent().parent().parent().parent();
        let sum = $(this).parent().parent();
        let price = Number($(sum).find('.venue-price').text().slice(0, -3));
        let quantity = Number($(sum).find('.quantity option:selected').text());
        let name = $(sum).parent().parent().parent().find('.venue-name').text();
        let id = $(sum).parent().parent().parent().attr('id');
        $('#venue-info').empty();
        $('#venue-info')
            .append($(`<span class="head">Confirm purchase</span>`))
            .append($(`<div class="purchase-info">`)
                .append($(`<span>${name}</span>`))
                .append($(`<span>${quantity} x ${price}</span>`))
                .append($(`<span>Total: ${quantity * price} lv</span>`))
                .append($(`<input type="button" value="Confirm">`).on('click', function () {
                    $.ajax({
                        method: 'POST',
                        url: URL + `rpc/kid_BJ_Ke8hZg/custom/purchase?venue=${id}&qty=${quantity}`,
                        headers: authHeaders
                    }).then(function (ticked) {
                        $('#venue-info').empty();
                        $('#venue-info')
                            .append(`You may print this page as your ticket`)
                            .append($(ticked.html))
                    })
                        .catch(throwError);
                })))
    }

    function details() {
        let item = $(this).parent().parent().find('.venue-details');
        if ($(item).css('display') === 'none'){
            $(item).css('display', 'block');
        } else {
            $(item).css('display', 'none');
        }
    }

    function throwError() {
        console.log('Error');
    }
}