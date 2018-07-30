$(() => {
    renderCatTemplate();

    async function renderCatTemplate() {
        let source = await $.get('./templates/articleCats.hbs');
        let template = Handlebars.compile(source);
        $('#allCats').append(template({cats}));
        $('.card-block button').on('click', showInfo);
    }

    function showInfo() {
        let div = $(this).parent().find('div');
        if (div.css('display') === 'none') {
            div.css('display', '');
            $(this).text('Hide status code');
        } else {
            div.css('display', 'none');
            $(this).text('Show status code');
        }
    }
});