const USERNAME = 'guest';
const PASS = 'guest';
const base64auth = btoa(USERNAME + ":" + PASS);
const authHeaders = { "Authorization": "Basic " + base64auth };
const URL = `https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock`;
let nextMessage = `Knock Knock.`;

function attachEvent() {
    $.ajax({
        method: 'GET',
        url : URL + `?query=${nextMessage}`,
        headers: authHeaders
    }).then(function (total) {
        if (total.message === undefined){
            $('#allMessage')
                .append($('<li>').text(total.answer));
            return;
        }
        $('#allMessage')
            .append($('<li>').text(total.message))
            .append($('<li>').text(total.answer));
        nextMessage = total.message;
        attachEvent();
    }).catch(throwError);
}
function throwError() {
    console.log(`Error`);
}