let receiptsService = (() => {
    async function getActiveReceipt(userId) {
        let currentReceipt = await remote.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"true"}`, 'kinvey');
        if (currentReceipt.length === 0) {
            return await createReceipt();
        }
        return currentReceipt[0];
    }
    function createReceipt() {
        let data = {
            active: true,
            productCount: 0,
            total: 0
        };
        return remote.post('appdata', `receipts`, 'kinvey', data);
    }
    function getMyReceipt(userId) {
        return remote.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`, 'kinvey');
    }
    function receiptDetails(receiptId) {
        return remote.get('appdata', `receipts/${receiptId}`, 'kinvey');
    }
    function commitReceipt(receiptId, productCount, total) {
        let data = {
            productCount,
            total,
            active: false
        };
        return remote.update('appdata', `receipts/${receiptId}`, 'kinvey', data)
    }

    return {
        getActiveReceipt,
        getMyReceipt,
        receiptDetails,
        commitReceipt
    };
})();