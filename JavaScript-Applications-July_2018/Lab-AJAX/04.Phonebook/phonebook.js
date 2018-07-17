const URL = `https://phonebook-be960.firebaseio.com/phonebook/`;
let phonebook = $('#phonebook');
$('#btnLoad').on('click', loadInformation);
$('#btnCreate').on('click', createContact);

function loadInformation() {
    $.ajax({
        method: 'GET',
        url: URL + '.json'
    }).then(function (data) {
        phonebook.empty();
        for (let element of Object.entries(data)) {
            let li = $('<li>').text(`${element[1]['name']}: ${element[1]['phone']}`)
                .append($('<a>').attr('href', '#').text(' [Delete]'));
            li.find('a').on('click', deleteContact.bind(this, element[0], li));
            phonebook.append(li);
        }
    }).catch(handleError);
}

function deleteContact(id, li) {
    $.ajax({
        method: 'DELETE',
        url: URL + id + '.json'
    }).then(function () {
        li.remove();
    }).catch(handleError);
}

function createContact() {
    let personName = $('#person');
    let phoneName = $('#phone');
    if (personName.val() === '' || phoneName.val() === '') {
        return;
    }
    $.ajax({
        method: 'POST',
        url: URL + '.json',
        data: JSON.stringify({
            name: personName.val(),
            phone: phoneName.val()
        }),
        contentType: 'application/json'
    }).then(function (id) {
        let li = $('<li>').text(`${personName.val()}: ${phoneName.val()}`)
            .append($('<a>').attr('href', '#').text(' [Delete]'));
        li.find('a').on('click', deleteContact.bind(this, id.name, li));
        phonebook.append(li);
        personName.val('');
        phoneName.val('');
    }).catch(handleError);
}

function handleError(err) {
    console.log(err);
}
