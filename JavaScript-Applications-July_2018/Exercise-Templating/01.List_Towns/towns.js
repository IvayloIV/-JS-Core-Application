async function attachEvents() {
    let sourceMainHtml = await $.get('./templates/mainHtml.hbs');
    let templateHtml = Handlebars.compile(sourceMainHtml);
    $('body').append(templateHtml);
    let root = $('#root');
    let townsInput = $('#towns');

    $('#btnLoadTowns').on('click', addTowns);

    function addTowns() {
        root.empty();
        let towns = townsInput.val().split(',').filter(a => a !== '').map(a => {
            return {name: a.trim()};
        });
        $.get('./templates/towns.hbs')
            .then(function (source) {
                let template = Handlebars.compile(source);
                root.append(template({towns}));
                townsInput.val('');
            }).catch(function (err) {
                console.log(err.message);
            });
    }
}