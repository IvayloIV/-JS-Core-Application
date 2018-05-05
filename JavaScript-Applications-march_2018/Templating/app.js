$(() => {
    let data;
    let detailsSourse;
    async function loadData() {
        data = await $.get('data.json');
        detailsSourse = await $.get('./templates/details.hbs');
        let source = await $.get('./templates/contacts.hbs');
        let template = Handlebars.compile(source);
        $('#list').append(template({data}));
        $('.contact').on('click', showInformation);
    }
    loadData();
    function showInformation() {
        $('.contact').removeClass('active');
        $(this).addClass('active');
        let index = $(this).attr('data-id');
        let template = Handlebars.compile(detailsSourse);
        $('#details').empty();
        $('#details').append(template(data[index]));
    }
});