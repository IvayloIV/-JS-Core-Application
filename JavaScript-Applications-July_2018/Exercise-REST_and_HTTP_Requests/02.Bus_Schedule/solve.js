function solve() {
    let nextId = `depot`;
    let currentStop = ``;
    let info = $('.info');
    let departInput = $('#depart');
    let arriveInput = $('#arrive');

    async function arrive() {
        info.text(`Arriving at ${currentStop}`);
        departInput.attr('disabled', false);
        arriveInput.attr('disabled', true);
    }

    function showError() {
        info.text('Error');
        departInput.attr('disabled', true);
        arriveInput.attr('disabled', true);
    }

    async function depart() {
        let stop;
        try {
            stop = await $.ajax({
                method: 'GET',
                url: `https://judgetests.firebaseio.com/schedufle/${nextId}.json`
            });
        } catch (e) {
            showError();
            return;
        }
        nextId = stop.next;
        currentStop = stop.name;
        info.text(`Next stop ${currentStop}`);
        departInput.attr('disabled', true);
        arriveInput.attr('disabled', false);
    }
    return {
        depart,
        arrive
    };
}