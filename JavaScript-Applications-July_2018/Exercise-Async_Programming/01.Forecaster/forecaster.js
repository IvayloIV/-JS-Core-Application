function attachEvents() {
    let locationInput = $('#location');
    let urlGetWeather = `https://judgetests.firebaseio.com/locations.json`;
    let urlCurrentWeather = `https://judgetests.firebaseio.com/forecast/today/`;
    let urlUpcomintWeather = `https://judgetests.firebaseio.com/forecast/upcoming/`;
    let forecast = $('#forecast');
    let icons = {
        Sunny: '&#x2600;',
        Partly_sunny: '&#x26C5;',
        Overcast: '&#x2601;',
        Rain: '&#x2614;',
        Degrees: '&#176;'
    };
    let currentDiv = $('#current');
    let upcomingDiv = $('#upcoming');

    $('#submit').on('click', showInformation);

    function showInformation() {
        $.ajax({
            method: 'GET',
            url: urlGetWeather
        }).then(function (weathers) {
            let code;
            for (let weather of weathers) {
                if (weather.name === locationInput.val()) {
                    code = weather.code;
                    break;
                }
            }
            if (!code) {
                throw new Error('Town missing.');
            } else {
                let currentWeather = $.ajax({
                    method: 'GET',
                    url: urlCurrentWeather + code + '.json'
                });
                let upcomingWeather = $.ajax({
                    method: 'GET',
                    url: urlUpcomintWeather + code + '.json'
                });
                Promise.all([currentWeather, upcomingWeather])
                    .then(function ([current, upcoming]) {
                        forecast.css('display', '');
                        currentDiv.empty();
                        currentDiv.append($('<div>').addClass('label').text('Current conditions'))
                            .append($('<span>').addClass('condition symbol').html(icons[current.forecast.condition.replace(' ', '_')]))
                            .append($('<span>').addClass('condition')
                                .append($('<span>').addClass('forecast-data').text(current.name))
                                .append($('<span>').addClass('forecast-data').html(`${current.forecast.low}${icons['Degrees']}/${current.forecast.high}${icons['Degrees']}`))
                                .append($('<span>').addClass('forecast-data').text(current.forecast.condition)));
                        upcomingDiv.empty();
                        upcomingDiv.append($('<div>').addClass('label').text('Three-day forecast'));
                        for (let element of upcoming.forecast) {
                            upcomingDiv.append($('<span>').addClass('upcoming')
                                .append($('<span>').addClass('symbol').html(icons[element.condition.replace(' ', '_')]))
                                .append($('<span>').addClass('forecast-data').html(`${element.low}${icons['Degrees']}/${element.high}${icons['Degrees']}`))
                                .append($('<span>').addClass('forecast-data').text(element.condition)));
                        }
                    }).catch(handleError);
            }
        }).catch(handleError);
    }

    function handleError() {
        forecast.css('display', '');
        currentDiv.empty();
        upcomingDiv.empty();
        currentDiv.append($('<div>').addClass('label').text('Error'));
    }
}