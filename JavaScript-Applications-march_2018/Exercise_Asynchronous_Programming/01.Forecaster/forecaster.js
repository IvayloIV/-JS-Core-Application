function attachEvents() {
    $('#submit').on('click', showForecaster);
    const URL = `https://judgetests.firebaseio.com/`;
    let code = '';
    const allCondition = {
        Sunny : '&#x2600;',
        Partlysunny : '&#x26C5;',
        Overcast : '&#x2601;',
        Rain : '&#x2614;',
        Degrees : '&#176;'
    };
    let current = $('#current');
    let upcoming = $('#upcoming');
    
    function showForecaster() {
        $.ajax({
            method: 'GET',
            url: URL + 'locations.json'
        }).then(function (whether) {
            let town = $('#location').val();
            if (town === ''){
                return;
            }
            let isHavingMatch = false;
            for (let whetherElement of whether) {
                if (whetherElement.name === town){
                    code = whetherElement.code;
                    isHavingMatch = true;
                    break;
                }
            }
            if(!isHavingMatch){
                throw new Error();
            }
            getWhether();
        }).catch(throwError);
        function getWhether() {
            $('#forecast').removeAttr('style');
            let p1 = $.ajax({
                method:'GET',
                url: URL + `forecast/today/${code}.json`
            });
            let p2 = $.ajax({
                method: 'GET',
                url: URL + `forecast/upcoming/${code}.json`
            });

            Promise.all([p1, p2]).then(function ([today, totalUpcoming]) {
                $(current).empty();
                $(current)
                    .append($('<div>').addClass('label').text('Current conditions'))
                    .append($('<span>').addClass('condition symbol').html(
                        allCondition[today.forecast.condition.replace(/\s+/g, '')]
                    ))
                    .append($('<span>').addClass('condition')
                        .append($('<span>').addClass('forecast-data').text(today.name))
                        .append($('<span>').addClass('forecast-data')
                            .html(`${today.forecast.low}${allCondition.Degrees}/${today.forecast.high}${allCondition.Degrees}`))
                        .append($('<span>').addClass('forecast-data').text(today.forecast.condition)));

                $(upcoming).empty();
                $(upcoming).append($('<div>').addClass('label').text('Three-day forecast'));
                for (let coming of totalUpcoming.forecast) {
                    $(upcoming).append($('<span>').addClass('upcoming')
                        .append($('<span>').addClass('symbol').html(
                            allCondition[coming.condition.replace(/\s+/g, '')]
                        )).append($('<span>').addClass('forecast-data')
                            .html(`${coming.low}${allCondition.Degrees}/${coming.high}${allCondition.Degrees}`))
                        .append($('<span>').addClass('forecast-data').text(coming.condition)));
                }
            }).catch(throwError);
        }
    }
    function throwError(err) {
        $('#forecast').empty();
        $('#forecast').append('<div>Error</div>');
    }
}