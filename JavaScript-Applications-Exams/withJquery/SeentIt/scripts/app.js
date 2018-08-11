function startApp() {
    showHideMenuLinks();
    if (sessionStorage.getItem('authToken')) {
        catalog();
    } else {
        showHomeView();
    }
    attachAllEvents();
}
