function loadAllBooks() {
    const URL = `https://baas.kinvey.com/appdata/kid_rJ0yo87Nm/`;
    const USERNAME = 'peter';
    const PASSWORDS = 'p';
    const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
    const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};

    let totalBooks = $('#books');
    let error = $('#error');
    let titleInput = $('#title');
    let authorInput = $('#author');
    let isbnInput = $('#isbn');

    $('.create').on('click', createBook);

    loadBooks();

    async function loadBooks() {
        totalBooks.text('Loading...');
        let books;
        try {
            books = await $.ajax({
                method: 'GET',
                url: URL + 'books',
                headers: AUTORIZATION
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        totalBooks.empty();
        error.text('');
        for (let book of books) {
            totalBooks.append(createHtmlBook(book));
        }
    }

    async function createBook() {
        let book;
        error.text('');
        try {
            book = await $.ajax({
                method: 'POST',
                url: URL + 'books',
                headers: AUTORIZATION,
                data: JSON.stringify({
                    title: titleInput.val(),
                    author: authorInput.val(),
                    isbn: Number(isbnInput.val())
                }),
                contentType: 'application/json'
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        titleInput.val('');
        authorInput.val('');
        isbnInput.val('');
        totalBooks.append(createHtmlBook(book));
    }

    async function deleteBook() {
        error.text('');
        let item = $(this).parent();
        try {
            await $.ajax({
                method: 'DELETE',
                url: URL + 'books/' + item.attr('data-id'),
                headers: AUTORIZATION
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        item.remove();
    }

    async function updateBook() {
        error.text('');
        let item = $(this).parent();
        try {
            await $.ajax({
                method: 'PUT',
                url: URL + 'books/' + item.attr('data-id'),
                headers: AUTORIZATION,
                data: JSON.stringify({
                    title: item.find('.title').val(),
                    author: item.find('.author').val(),
                    isbn: Number(item.find('.isbn').val())
                }),
                contentType: 'application/json'
            });
        } catch (e) {
            error.text('Error');
        }
    }

    async function createNewTag() {
        error.empty();
        let item = $(this).parent().parent();
        let currentBook;
        try {
            currentBook = await $.ajax({
                method: 'GET',
                url: URL + 'books/' + item.attr('data-id'),
                headers: AUTORIZATION
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        let currentTags = [];
        if (currentBook.tags !== undefined) {
            currentTags = JSON.parse(currentBook.tags);
        }
        currentTags.push(item.find('.creteTag').val());
        currentBook.tags = JSON.stringify(currentTags);
        try {
            await $.ajax({
                method: 'PUT',
                url: URL + 'books/' + item.attr('data-id'),
                headers: AUTORIZATION,
                data: JSON.stringify(currentBook),
                contentType: 'application/json'
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        let itemLi = $('<li>').append($('<input>').val(item.find('.creteTag').val()))
            .append($('<button>').text('Delete').on('click', deleteTag));
        itemLi.insertBefore(item.find('.creteTag'));
        item.find('.creteTag').val('');
    }

    async function deleteTag() {
        let item = $(this).parent();
        let text = item.find('input').val();
        error.empty();
        let currentBook;
        try {
            currentBook = await $.ajax({
                method: 'GET',
                url: URL + 'books/' + item.parent().parent().attr('data-id'),
                headers: AUTORIZATION
            });
        } catch (e) {
            error.text('Error');
            return;
        }
         let currentTags = JSON.parse(currentBook.tags);
        let index = currentTags.indexOf(text);
        currentTags.splice(index, 1);
        currentBook.tags = JSON.stringify(currentTags);
        try {
            await $.ajax({
                method: 'PUT',
                url: URL + 'books/' + item.parent().parent().attr('data-id'),
                headers: AUTORIZATION,
                data: JSON.stringify(currentBook),
                contentType: 'application/json'
            });
        } catch (e) {
            error.text('Error');
            return;
        }
        item.remove();
    }

    function createHtmlBook(currentBook) {
        let li =  $('<li>').attr('data-id', currentBook._id)
            .append($('<input>').addClass('author').val(currentBook.author))
            .append($('<input>').addClass('title').val(currentBook.title))
            .append($('<input>').addClass('isbn').val(currentBook.isbn))
            .append($('<button>').text('Update').on('click', updateBook))
            .append($('<button>').text('Delete').on('click', deleteBook));
        let ul = $('<ul>').addClass('tags');
        let tags = currentBook.tags;
        if (tags !== undefined) {
            tags = JSON.parse(tags);
            for (let tag of tags) {
                ul.append($('<li>').append($('<input>').val(tag))
                    .append($('<button>').text('Delete').on('click', deleteTag)));
            }
        }
        ul.append($('<input>').addClass('creteTag'))
            .append($('<button>').addClass('buttonCreateTag').text('Create Tag').on('click', createNewTag));
        li.append(ul);
        return li;
    }
}