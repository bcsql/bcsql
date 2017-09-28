const DataType = function(contract) {
    const dataType = {};

    dataType.checkDataType = (type) => {
        return contract.deployed().then((instance) => {
            return instance.checkDataType.call(type);
        });
    };

    dataType.addDataType = (type, params) => {
        return contract.deployed().then(function(instance) {
            return instance.addDataType(type, params);
        }).then(function(result) {
            if (result.logs.some(function(item) {
                return 'mined' == item.type && 'DataTypeAdded' == item.event && item.args.dataType == type
            })) {
                return {
                    transactionHash: result.receipt.transactionHash,
                    blockNumber: result.receipt.blockNumber,
                    gasUsed: result.receipt.gasUsed,
                }; // success
            }

            throw Error('Got no DataTypeAdded event');
        });
    };

    return dataType;
};

module.exports = DataType;
