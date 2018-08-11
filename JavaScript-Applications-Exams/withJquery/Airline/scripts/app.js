function startApp() {
    showHideMenuLinks()
    if (sessionStorage.getItem('authToken')) {
        catalog()
    } else {
        showLoginView();
    }
    attachAllEvents()
}
