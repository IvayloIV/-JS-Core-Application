let productsService = (() => {
    function getAllProducts() {
        return remote.get('appdata', `products`, 'kinvey');
    }
    function detailsUser(userId) {
        return remote.get('user', userId, 'kinvey');
    }
    async function updateUser(userId, userInfo) {
        return remote.update('user', userId, 'kinvey', userInfo);
    }
    return {
        getAllProducts,
        detailsUser,
        updateUser
    }
})();