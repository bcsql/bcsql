const DataType = require('./dataType.js');
const Db = require('./db.js');
const Table = require('./table.js');
const Column = require('./column.js');

const BC = function(contract, config) {
    const bc = {};
    const dataType = DataType(contract);
    const db = Db(contract);
    const table = Table(contract);
    const column = Column(contract);

    bc.checkDataType = (type, res) => {
        dataType.checkDataType(type)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    bc.addDataType = (type, res) => {
        // TODO check does Data Type not exist
        dataType.addDataType(type, {from: config.address, gas: 50000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => {res.json({success: 'error', error: err.message})});
    };

    bc.getDbsCount = (res) => {
        db.getDbsCount()
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err}));
    };

    bc.getDbNameByIndex = (index, res) => {
        db.getDbNameByIndex(index)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    bc.getDbData = (name, res) => {
        db.getDbData(name)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    bc.createDb = (name, res) => {
        // TODO check is DB name not in use
        db.createDb(name, {from: config.address, gas: 150000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.initTable = (dbName, tableName, res) => {
        // TODO check does db exists and enought rights and table name not in use
        table.initTable(dbName, tableName, {from: config.address, gas: 1000000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.getTablesCount = (res) => {
        table.getTablesCount()
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.getTableId = (dbName, tableName, res) => {
        table.getTableId(dbName, tableName)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.getTableData = (id, res) => {
        table.getTableData(id)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    bc.createTable = (id, res) => {
        // TODO check does table have columns and PK end enough rights
        table.createTable(id, {from: config.address, gas: 100000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.addColumn = (id, columnName, dataType, nullable, unique, isPrimaryKey, res) => {
        // TODO check is table just inited and enough rights
        column.addColumn(id, columnName, dataType, nullable, unique, isPrimaryKey, {from: config.address, gas: 500000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    bc.getColumnData = (id, index, res) => {
        column.getColumnData(id, index)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    return bc;
};

module.exports = BC;
