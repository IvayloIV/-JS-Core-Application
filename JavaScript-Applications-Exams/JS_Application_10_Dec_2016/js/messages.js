let message = (() => {
    function myMessages(username) {
        return remote.get('appdata', `messages?query={"recipient_username":"${username}"}`, 'kinvey');
    }

    function allUsers() {
        return remote.get('user', '', 'kinvey');
    }

    function sendMessage(sender_username, sender_name, recipient_username, text) {
        let data = {sender_username, sender_name, recipient_username, text};
        return remote.post('appdata', 'messages', 'kinvey', data);
    }

    function archiveMessages(username) {
        return remote.get('appdata', `messages?query={"sender_username":"${username}"}`, 'kinvey');
    }

    function deleteMessages(id) {
        return remote.remove('appdata', `messages/${id}`, 'kinvey');
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }


    return {
        myMessages,
        formatDate,
        formatSender,
        allUsers,
        sendMessage,
        archiveMessages,
        deleteMessages
    };
})();