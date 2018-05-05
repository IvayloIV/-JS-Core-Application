(function () {
    class Header {
        constructor(id, text) {
            this.id = id;
            this.text = text;
        }
    }

    let authHeader = [
        new Header('linkHome', 'Home'),
        new Header('linkLogin', 'Login'),
        new Header('linkRegister', 'Register'),
    ];

    let unAuthHeader = [
        new Header('linkHome', 'Home'),
        new Header('linkListAds', 'List Advertisements'),
        new Header('linkCreateAd', 'Create Advertisement'),
        new Header('linkLogout', 'Logout'),
    ];

    window.mainHeaders = {
        authHeader,
        unAuthHeader
    };
})();