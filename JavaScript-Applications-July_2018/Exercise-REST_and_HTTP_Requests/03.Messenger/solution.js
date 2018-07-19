function attachEvents() {
    let textArea = $('#messages');
    let authorInput = $('#author');
    let contentInput = $('#content');
    const URL = `https://messanger-8cb96.firebaseio.com/messanger/.json`;
    $('#refresh').on('click', loadData);
    $('#submit').on('click', createData);
    
    function loadData() {
        textArea.empty();
        $.ajax({
            method: 'GET',
            url: URL
        }).then(function (data) {
            let totalTextArr = [];
            for (let currentData of Object.entries(data).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp))) {
                totalTextArr.push(`${currentData[1]['author']}: ${currentData[1]['content']}`);
            }
            textArea.text(totalTextArr.join('\n'));
        }).catch(showError);
    }
    
    function createData() {
        if (authorInput.val() === '' || contentInput.val() === '') {
            return;
        }
        let data = {
            author: authorInput.val(),
            content: contentInput.val(),
            timestamp: Date.now()
        };
        $.ajax({
            method: 'POST',
            url: URL,
            data: JSON.stringify(data),
            contentType: 'application/json'
        }).then(function () {
            let totalText = textArea.text() + `\n${authorInput.val()}: ${contentInput.val()}`;
            textArea.text(totalText.trim());
            contentInput.val('');
        }).catch(showError);
    }

    function showError() {
        textArea.text('Error');
    }
}