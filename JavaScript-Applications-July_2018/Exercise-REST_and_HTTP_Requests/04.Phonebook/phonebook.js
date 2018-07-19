function attachEvents() {
    const URL = `https://phonebook2-eb35c.firebaseio.com/phonebook`;
    let phonebook = $('#phonebook');
    let personInput = $('#person');
    let phoneInput = $('#phone');
    $('#btnLoad').on('click', loadData);
    $('#btnCreate').on('click', createData);

    function loadData() {
        phonebook.empty();
        $.ajax({
            method: 'GET',
            url: URL + '.json'
        }).then(function (data) {
            if (data === null) {
                return;
            }
            for (let el of Object.entries(data)) {
                let li = $('<li>').text(`${el[1]['person']}: ${el[1]['phone']} `);
                li.append($('<button>').text('[Delete]').on('click', function () {
                    $.ajax({
                        method: 'DELETE',
                        url: URL + `/${el[0]}.json`
                    }).then(() => {
                        $(this).parent().remove();
                    });
                }));
                phonebook.append(li);
            }
        }).catch(handleError);
    }
    
    function createData() {
        $.ajax({
            method: 'POST',
            url: URL + '.json',
            data: JSON.stringify({
                person: personInput.val(),
                phone: phoneInput.val()
            }),
            contentType: 'application/json'
        }).then(function () {
            loadData();
            personInput.val('');
            phoneInput.val('');
        }).catch(handleError);
    }

    function handleError() {
        phonebook.append($('<li>').text('Error'));
    }
}