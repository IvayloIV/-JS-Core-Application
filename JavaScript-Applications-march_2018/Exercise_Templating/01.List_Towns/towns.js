function attachEvents() {
    $('#btnLoadTowns').on('click', loadInformation);

    async function loadInformation() {
        let arr = $('#towns').val().split(',').map(a => ({name : a.trim()})).filter(a => a !== '');
        let source = await $.get('tempTowns.hbs');
        let template = Handlebars.compile(source);
        if (arr.length === 1 && arr[0] === ''){
            arr = null;
        }
        $('#root').empty();
        $('#root').append(template({town: arr}));
    }
}