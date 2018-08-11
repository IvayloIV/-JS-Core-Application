function startApp() {
    showHideMenuLinks();
    if (sessionStorage.getItem('authToken')) {
        viewHome()
    } else {
        showHomeView();
    }
    attachAllEvents();
}
