function attachEvents() {
    const url = 'https://phonebook-nakov.firebaseio.com/phonebook';
    $('#btnLoad').on('click', showPhones);
    $('#btnCreate').on('click', createPhone);

    function createPhone() {
        let person = $('#person');
        let phone = $('#phone');
        $.ajax({
            method: 'POST',
            url : url + '.json',
            data: JSON.stringify({phone: $(phone).val(), person: $(person).val()}),
            success: createNewPhone,
            error: throwError
        });
        function createNewPhone() {
            showPhones();
        }
        $(person).val('');
        $(phone).val('');
    }

    function showPhones() {
        $('#phonebook').empty();
        $.ajax({
            method: 'GET',
            url: url + '.json',
            success: listArticles,
            error: throwError
        });
        function listArticles(repos) {
            if (repos === null){
                return;
            }
            for (let repo of Object.entries(repos)) {
                $('#phonebook').append($('<li>').text(`${repo[1].person}: ${repo[1].phone} `)
                    .append($("<button>Delete</button>").on('click', removePhone.bind(this, repo[0]))));
            }
        }
        function removePhone(key) {
            let request = {
                method: 'DELETE',
                url: url + '/'+ key + '.json'
            };
            $.ajax(request)
                .then(showPhones)
                .catch(throwError);
        }
    }
    function throwError() {
        $('#phonebook').append($('<li>').text('Error'));
    }
}
