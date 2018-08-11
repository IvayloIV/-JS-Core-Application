let entryService = (() => {
    function getEntriesByReceipt(receiptId) {
        return remote.get('appdata', `entries?query={"receiptId":"${receiptId}"}`, 'kinvey');
    }
    function createEntry(type, qty, price, receiptId) {
        let data = {type, qty, price, receiptId};
        return remote.post('appdata', `entries`, 'kinvey', data);
    }
    function deleteEntry(entryId) {
        return remote.remove('appdata', `entries/${entryId}`, 'kinvey')
    }

    return {
        getEntriesByReceipt,
        createEntry,
        deleteEntry
    };
})();