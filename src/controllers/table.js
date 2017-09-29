const Table = function(contract, config) {
    const table = {};

    table.getTablesCount = () => {
        return contract.deployed().then((instance) => {
            return instance.getTablesCount.call();
        }).then((result) => {
            return result.toNumber();
        });
    };

    table.initTable = (dbName, tableName, params) => {
        return contract.deployed().then(function(instance) {
            return instance.initTable(dbName, tableName, params);
        }).then(function(result) {
            if (result.logs.some(function(item) {
                    return 'mined' == item.type && 'TableInited' == item.event && item.args.dbName == dbName && item.args.name == tableName
                })) {
                return {
                    transactionHash: result.receipt.transactionHash,
                    blockNumber: result.receipt.blockNumber,
                    gasUsed: result.receipt.gasUsed,
                    id: result.logs[0].args.id.toNumber(),
                }; // success
            }

            throw Error('Got no TableInited event');
        });
    };

    table.getTableId = (dbName, tableName) => {
        return contract.deployed().then(function(instance) {
            return instance.getTableId.call(dbName, tableName);
        });
    };

    table.getTableData = (id) => {
        return contract.deployed().then(function(instance) {
            return instance.getTableData.call(id);
        });
    };

    table.createTable = (id, params) => {
        return contract.deployed().then(function(instance) {
            console.log('???');
            return instance.createTable(id, params);
        }).then(function(result) {
            console.log(result);
            if (result.logs.some(function(item) {
                return 'mined' == item.type && 'TableCreated' == item.event && item.args.id == id
            })) {
                return {
                    transactionHash: result.receipt.transactionHash,
                    blockNumber: result.receipt.blockNumber,
                    gasUsed: result.receipt.gasUsed,
                }; // success
            }

            throw Error('Got no CreateTable event');
        });
    };

    return table;
};

module.exports = Table;
