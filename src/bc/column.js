const Column = function(contract) {
    const column = {};

    column.addColumn = (id, columnName, dataType, nullable, unique, isPrimaryKey, params) => {
        return contract.deployed().then(function(instance) {
            return instance.addColumn(id, columnName, dataType, nullable, unique, isPrimaryKey, params);
        }).then(function(result) {
            return {
                transactionHash: result.receipt.transactionHash,
                blockNumber: result.receipt.blockNumber,
                gasUsed: result.receipt.gasUsed,
            };
        });
    };

    column.getColumnData = (id, index) => {
        return contract.deployed().then(function(instance) {
            return instance.getColumnData.call(id, index);
        });
    };

    return column;
};

module.exports = Column;
