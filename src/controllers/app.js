const DataType = require('./dataType.js');
const Db = require('./db.js');
const Table = require('./table.js');

const App = function(contract, config) {
    const app = {};
    const dataType = DataType(contract);
    const db = Db(contract);
    const table = Table(contract);

    app.checkDataType = (type, res) => {
        dataType.checkDataType(type)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    app.addDataType = (type, res) => {
        // TODO check does Data Type not exist
        dataType.addDataType(type, {from: config.address, gas: 50000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => {res.json({success: 'error', error: err.message})});
    };

    app.getDbsCount = (res) => {
        db.getDbsCount()
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err}));
    };

    app.getDbNameByIndex = (index, res) => {
        db.getDbNameByIndex(index)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    app.getDbData = (name, res) => {
        db.getDbData(name)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    app.createDb = (name, res) => {
        // TODO check is DB name not in use
        db.createDb(name, {from: config.address, gas: 150000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => {res.json({success: 'error', error: err.message})});
    };

    app.initTable = (dbName, tableName, res) => {
        // TODO check does db exists and enought rights and table name not in use
        table.initTable(dbName, tableName, {from: config.address, gas: 1000000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    app.getTablesCount = (res) => {
        table.getTablesCount()
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    app.getTableId = (dbName, tableName, res) => {
        table.getTableId(dbName, tableName)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    app.getTableData = (id, res) => {
        table.getTableData(id)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    app.createTable = (id, res) => {
        // TODO check does table have columns and PK end enough rights
        table.createTable(id, {from: config.address, gas: 1000000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    app.addColumn = (id, columnName, dataType, nullable, unique, isPrimaryKey, res) => {
        // TODO check is table just inited and enough rights
        column.addColumn(id, columnName, dataType, nullable, unique, isPrimaryKey, {from: config.address, gas: 1000000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error', error: err.message}));
    };

    app.getColumnData = (id, index, res) => {
        column.getColumnData(id, index)
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => res.json({success: 'error'}));
    };

    return app;
};

module.exports = App;
