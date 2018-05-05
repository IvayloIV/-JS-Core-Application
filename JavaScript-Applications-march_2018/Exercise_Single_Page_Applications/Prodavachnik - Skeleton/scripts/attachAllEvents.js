function attachAllEvents() {
    $('#linkHome').on('click', showHomeView);
    $('#linkLogin').on('click', showLoginView);
    $('#linkRegister').on('click', showRegisterView);
    $('#linkListAds').on('click', showListAdsView);
    $('#linkCreateAd').on('click', showCreateAdView);
    $('#linkLogout').on('click', logOut);

    $('#buttonLoginUser').on('click', loginUser);
    $('#buttonRegisterUser').on('click', registerUser);
    $('#buttonCreateAd').on('click', createAd);
    $('#buttonEditAd').on('click', editAd);
}

$(document).on({
    ajaxStart: function () {
        $('#loadingBox').show();
    },
    ajaxStop: function () {
        $('#loadingBox').hide();
    }
});