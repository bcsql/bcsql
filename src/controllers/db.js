const Db = function(contract, config) {
    const db = {};

    db.getDbsCount = () => {
        return contract.deployed().then((instance) => {
            return instance.getDbsCount.call();
        }).then((result) => {
            return result.toNumber();
        });
    };

    db.getDbNameByIndex = (index) => {
        return contract.deployed().then(function(instance) {
            return instance.getDbNameByIndex.call(index);
        });
    };

    db.getDbData = (name) => {
        return contract.deployed().then(function(instance) {
            return instance.getDbData.call(name);
        });
    };

    db.createDb = (name, params) => {
        return contract.deployed().then(function(instance) {
            return instance.createDb(name, params);
        }).then(function(result) {
            // console.log(result);
            if (result.logs.some(function(item) {
                return 'mined' == item.type && 'DbCreated' == item.event && item.args.name == name
            })) {
                return {
                    transactionHash: result.receipt.transactionHash,
                    blockNumber: result.receipt.blockNumber,
                    gasUsed: result.receipt.gasUsed,
                }; // success
            }

            throw Error('Got no CreateDb event');
        });
    };

    return db;
};

module.exports = Db;
