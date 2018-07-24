const URL = `https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock`;
const USERNAME = 'guest';
const PASSWORDS = 'guest';
const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
let nextMessage = `Knock Knock.`;
let allMessages = $('#messages');
allMessages.append($('<li>').text(nextMessage));

getMessage();

function getMessage() {
    $.ajax({
        method: 'GET',
        url: URL + `?query=${nextMessage}`,
        headers: AUTORIZATION
    }).then(function (messageInfo) {
        allMessages.append($('<li>').text(messageInfo.answer));
        if (messageInfo.message === undefined) {
            return;
        }
        allMessages.append($('<li>').text(messageInfo.message));
        nextMessage = messageInfo.message;
        getMessage();
    }).catch(handleError);
}

function handleError() {
    allMessages.text('Error');
}