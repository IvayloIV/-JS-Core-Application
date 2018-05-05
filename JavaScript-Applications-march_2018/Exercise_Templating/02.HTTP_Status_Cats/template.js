$(() => {
    async function renderCatTemplate() {
        let source = await $.ajax({
            method: 'GET',
            url: 'templateCats.hbs'
        });
        let template = Handlebars.compile(source);
        $('#allCats').empty();
        $('#allCats').append(template({cats}));
        $('button.btn').on('click', showInformation);
    }
    renderCatTemplate();
    function showInformation() {
        let btn = $(this).parent().find('div').css('display');
        $(this).parent().find('div').toggle();
        if (btn === 'none'){
            $(this).text('Hide status code');
        } else {
            $(this).text('Show status code');
        }
    }
});