let userService = (() => {
    function getUserById(userId) {
        return remote.get('user', userId, 'kinvey');
    }

    function deleteUser(userId) {
        return remote.remove("user", userId, 'kinvey');
    }

    return {
        getUserById,
        deleteUser
    }
})();