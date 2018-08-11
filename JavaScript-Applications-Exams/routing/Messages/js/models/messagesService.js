let messagesService = (() => {
    function myMessages(username) {
        return remote.get('appdata', `messages?query={"recipient_username":"${username}"}`, 'kinvey');
    }
    function listBySender(username) {
        return remote.get('appdata', `messages?query={"sender_username":"${username}"}`, 'kinvey');
    }
    function listAllUser() {
        return remote.get('user', ``, 'kinvey');
    }
    function sendMessage(recipient_username, text) {
        let data = {
            sender_username: sessionStorage.getItem('username'),
            sender_name: sessionStorage.getItem('name'),
            recipient_username,
            text
        };
        return remote.post('appdata', `messages`, 'kinvey', data);
    }
    function deleteMessage(messageId) {
        return remote.remove('appdata', `messages/${messageId}`, 'kinvey');
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
        listBySender,
        listAllUser,
        sendMessage,
        deleteMessage,
        formatDate,
        formatSender
    };
})();