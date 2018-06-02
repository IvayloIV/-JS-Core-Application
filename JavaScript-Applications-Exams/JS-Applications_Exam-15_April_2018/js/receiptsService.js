let receipts = (() => {
    async function getActiveReceipt(userId) {
        let currentReceipt = await remote.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"true"}`, 'kinvey');
        if (currentReceipt.length === 0){
            currentReceipt = createReceipt();
        } else {
            currentReceipt = currentReceipt[0];
        }
        return currentReceipt;
    }

    async function createReceipt() {
        let data = {"active": true, "productCount": 0, "total": 0};
        return await remote.post('appdata', 'receipts', 'kinvey', data)
    }

    function getMyReceipts(userId) {
        return remote.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`, 'kinvey');
    }

    function detailsReceipts(receiptId) {
        return remote.get('appdata', `receipts/${receiptId}`, 'kinvey');
    }

    function commitReceipt(receiptId, data) {
        return remote.update('appdata', `receipts/${receiptId}`, 'kinvey', data);
    }

    return {
        getActiveReceipt,
        getMyReceipts,
        detailsReceipts,
        commitReceipt,
    };
})();