let auth = 'guest' + ':' + 'guest';
let url = `https://baas.kinvey.com/appdata/kid_BJXTsSi-e/students`;
$.ajax({
    method : 'GET',
    url : url,
    headers: { "Authorization": "Basic " + btoa(auth) }
}).then(function (studends) {
    for (let studend of studends.sort((a, b) => a.ID - b.ID)) {
        $('#results').append($('<tr>').addClass('result')
            .append($('<td>').text(studend.ID))
            .append($('<td>').text(studend.FirstName))
            .append($('<td>').text(studend.LastName))
            .append($('<td>').text(studend.FacultyNumber))
            .append($('<td>').text(studend.Grade)))
    }
});

function createStudent(ID, FirstName, LastName, FacultyNumber, Grade) {
    $.ajax({
        method: 'POST',
        url : url,
        headers: { "Authorization": "Basic " + btoa(auth) },
        contentType: 'application/json',
        data: JSON.stringify({ID, FirstName, LastName, FacultyNumber, Grade})
    }).then(() => {console.log('Okey!')})
        .catch(() => {console.log('Error')});
}