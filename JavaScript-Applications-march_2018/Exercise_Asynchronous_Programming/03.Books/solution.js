function loadAllBooks() {
    const USERNAME = 'peter';
    const PASS = 'p';
    const base64auth = btoa(USERNAME + ":" + PASS);
    const authHeaders = { "Authorization": "Basic " + base64auth };
    const URL = 'https://baas.kinvey.com/appdata/kid_BkdEmAGpz/books/';
    loadBooks();
    $('.create').on('click', addNewBook);

    function loadBooks() {
        $('#books').text('Loading...');
        $.ajax({
            method: 'GET',
            url: URL,
            headers: authHeaders
        }).then(function (books) {
            clearOldData();
            for (let book of books) {
                $('#books').append(createHtml(book.title, book.author, book.isbn, book._id));
            }
        }).catch(throwError);
    }

    function createHtml(title, author, isbn, id) {
        return $('<li>').addClass(id)
            .append($('<input>').addClass('title').val(title))
            .append($('<input>').addClass('author').val(author))
            .append($('<input>').addClass('isbn').val(isbn))
            .append($('<button>').addClass('update').text('Update').on('click', function () {
                let li = $(`li.${id}`);
                $.ajax({
                    method: 'PUT',
                    url : URL + id,
                    headers: authHeaders,
                    contentType: 'application/json',
                    data : JSON.stringify({
                        title : $(li).find('.title').val(),
                        author : $(li).find('.author').val(),
                        isbn : $(li).find('.isbn').val()
                    })
                }).then(function () {
                    loadBooks();
                }).catch(throwError);
            }))
            .append($('<button>').addClass('delete').text('Delete').on('click', function () {
                $.ajax({
                    method: 'DELETE',
                    url : URL + id,
                    headers: authHeaders
                }).then(() => $(this).parent().remove()).catch(throwError);
            }));
    }

    function addNewBook() {
        let title = $('#title').val();
        let author = $('#author').val();
        let isbn = $('#isbn').val();
        if (title === '' || author === '' || isbn === ''){
            $('#error').text('Fill empty inputs');
            return;
        }
        $.ajax({
            method:'POST',
            url:URL,
            headers:authHeaders,
            contentType:'application/json',
            data: JSON.stringify({title, author, isbn})
        }).then(function (newBook) {
            $('#error').empty();
            $('#books').append(createHtml(title, author, isbn, newBook._id));
        }).catch(throwError);
        $('#title').val('');
        $('#author').val('');
        $('#isbn').val('');
    }

    function clearOldData() {
        $('#books').empty();
        $('#error').empty();
    }

    function throwError() {
        clearOldData();
        $('#error').text('Invalid data');
    }
}
