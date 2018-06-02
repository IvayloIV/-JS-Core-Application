let entries = (() => {
    function getEntries(receiptId) {
        return remote.get('appdata', `entries?query={"receiptId":"${receiptId}"}`, 'kinvey');
    }

    function createEntries(type, qty, price, receiptId) {
        let data = {type, qty, price, receiptId};
        return remote.post('appdata', `entries`, 'kinvey', data);
    }

    function deleteEntries(entryId) {
        return remote.remove('appdata', `entries/${entryId}`, 'kinvey');
    }
    return {
        getEntries,
        createEntries,
        deleteEntries
    }
})();