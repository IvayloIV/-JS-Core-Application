let contactService = (function () {
    function showAllContacts() {
        return remote.get('user', '', 'kinvey');
    }
    function getCurrentContact(id) {
        return remote.get('user', id, 'kinvey');
    }
    function updateUser(userId, firstName, lastName, phone, currentEmail) {
        return remote.update('user', userId, 'kinvey', {firstName, lastName, phone, currentEmail})
    }
    return {
        showAllContacts,
        getCurrentContact,
        updateUser
    }
})();