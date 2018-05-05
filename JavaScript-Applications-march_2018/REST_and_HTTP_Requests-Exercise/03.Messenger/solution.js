function attachEvents() {
    const url = `https://book-1b73a.firebaseio.com/`;
    $('#refresh').on('click', refreshMesseges);
    $('#submit').on('click', submitMesseges.bind(this));

    function refreshMesseges() {
        $.ajax({
            method: 'GET',
            url: url + '.json',
            success: showMess,
            error: showError
        });
        function showMess(messages) {
            let formatedMess = [];
            for (let message of Object.entries(messages).sort((a, b) => a[1]['timestamp'] - b[1]['timestamp'])) {
                formatedMess.push(`${message[1]['author']}: ${message[1]['content']}`);
            }
            $('#messages').text(formatedMess.join('\n'));
        }
    }

    function submitMesseges() {
        let author = $('#author').val();
        let content = $('#content').val();
        $.ajax({
            method: 'POST',
            url: url + '.json',
            data: JSON.stringify({
               author: author,
               content: content,
               timestamp: Date.now()
            }),
            success: createMessage.bind(this),
            error: showError
        });

        function createMessage() {
            $('#messages').text($('#messages').text() + `\n${author}: ${content}`);
        }
    }

    function showError() {
        $('#messages').text('Error');
    }
}