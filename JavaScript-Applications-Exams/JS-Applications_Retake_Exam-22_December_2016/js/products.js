let products = (() => {
    function getAllProducts() {
        return remote.get('appdata', 'products', 'kinvey');
    }
    function getCurrentUser(userId) {
        return remote.get('user', userId, 'kinvey');
    }
    function updateUser(userId, data) {
        return remote.update('user', userId, 'kinvey', data);
    }
    return {
        getAllProducts,
        getCurrentUser,
        updateUser
    }
})();