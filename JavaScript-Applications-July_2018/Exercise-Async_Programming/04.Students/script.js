const URL = `https://baas.kinvey.com/appdata/kid_BJXTsSi-e/`;
const USERNAME = 'guest';
const PASSWORDS = 'guest';
const BASE_64 = btoa(USERNAME + ':' + PASSWORDS);
const AUTORIZATION = {'Authorization': 'Basic ' + BASE_64};
let results = $('#results');

loadData();

function loadData() {
    $.ajax({
        method: 'GET',
        url: URL + 'students',
        headers: AUTORIZATION
    }).then(function (students) {
        results.empty();
        results.append('<tbody>').append($('<tr>')
            .append($('<th>').text('ID'))
            .append($('<th>').text('First Name'))
            .append($('<th>').text('Last Name'))
            .append($('<th>').text('Faculty Number'))
            .append($('<th>').text('Grade')));
        for (let student of students.sort((a, b) => a['ID'] - b['ID'])) {
            console.log(student);
            results.find('tbody').append($('<tr>')
                .append($('<td>').text(student.ID))
                .append($('<td>').text(student.FirstName))
                .append($('<td>').text(student.LastName))
                .append($('<td>').text(student.FacultyNumber))
                .append($('<td>').text(student.Grade)));
        }
    }).catch(function () {
        console.log('Error');
    });
}

function createData(ID, FirstName, LastName, FacultyNumber, Grade) {
    $.ajax({
        method: 'POST',
        url: URL + 'students',
        headers: AUTORIZATION,
        data: JSON.stringify({ID: Number(ID), FirstName, LastName, FacultyNumber, Grade: Number(Grade)}),
        contentType: 'application/json'
    }).then(loadData)
        .catch(function () {
            console.log('Error');
        });
}