function solve() {
    let currentState = '';
    let nextState = 'depot';
    function depart() {
        $.ajax({
            method: 'GET',
            url: `https://judgetests.firebaseio.com/schedule/${nextState}.json`,
            success: updateInformation,
            error: throwError
        });
        function updateInformation(bus) {
            currentState = bus['name'];
            nextState = bus['next'];
            $('.info').text(`Next stop ${currentState}`);
            $('#arrive').attr('disabled', false);
            $('#depart').attr('disabled', true);
        }
        function throwError() {
            $('.info').text(`Error`);
            $('#depart').attr('disabled', true);
            $('#arrive').attr('disabled', true);
        }
    }
    function arrive() {
        $('#depart').attr('disabled', false);
        $('#arrive').attr('disabled', true);
        $('.info').text(`Arriving at ${currentState}`);
    }
    return {
        depart,
        arrive
    };
}
let result = solve();