$(() => {
    let data;
    let details;
    loadData();

    async function loadData() {
        data = await $.get('./data.json');
        details = await $.get('./templates/details/details.hbs');
        let articleContactsSource = await $.get('./templates/list/articleContacts.hbs');
        let articleContactsTemplate = Handlebars.compile(articleContactsSource);
        let articleContactsHtml = articleContactsTemplate({contacts: data});
        let listSource = await $.get('./templates/list/list.hbs');
        let listTemplate = Handlebars.compile(listSource);
        Handlebars.registerPartial('articleContacts', articleContactsHtml);
        $('#book').append(listTemplate);
        $('.contact').on('click', showMore);
    }

    async function showMore() {
        $('#details').remove();
        let index = $(this).attr('data-id');
        let person = data[index];
        let detailsTemplate = Handlebars.compile(details);
        let infoSource = await $.get('./templates/details/info.hbs');
        let infoTemplate = Handlebars.compile(infoSource);
        let infoHtml = infoTemplate(person);
        Handlebars.registerPartial('info', infoHtml);
        $('.contact').css('background', '');
        $(this).css('background', '#d59450');
        $('#book').append(detailsTemplate);
    }
});