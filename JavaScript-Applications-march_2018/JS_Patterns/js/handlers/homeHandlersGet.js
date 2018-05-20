handlers.home = function (ctx) {
    ctx.isAuth = auth.isAuth();

    $.get('./data.json').then(function (users) {
        ctx.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs',
            login: './templates/forms/login.hbs',
            navbar: './templates/common/navbar.hbs',
            contacts: './templates/contacts/contacts.hbs',
            details: './templates/contacts/details.hbs',
            currentContacts: './templates/contacts/indexContacts.hbs'
        }).then(function () {
            ctx.contact = users;
            ctx.partials = this.partials;
            render();
        });
    });

    function render() {
        ctx.partial('./templates/welcome.hbs').then(attachEvents);
    }

    function attachEvents() {
        $('.contact').on('click', function () {
            let index = Number($(this).attr('data-id'));
            let userInformation = ctx.contact[index];
            ctx.selected = userInformation;
            render();
        });
    }
} ;