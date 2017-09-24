// var expect = require('chai').expect;
var BlockchainDB = artifacts.require("./bcSQL.sol");

contract('bcSQL', function(accounts) {
    var bdb;

    it("Create DB", function () {
        return BlockchainDB.deployed().then(function (instance) {
            console.log('Contract at ' + instance.address);
            bdb = instance;
            return bdb.createDb('db1', {from: accounts[0]});
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'DbCreated');
            assert.equal(result.logs[0].args.name, 'db1');
            return bdb.getDbsCount.call();
        }).then(function (result) {
            assert.equal(result.toNumber(), 1, '1 Db was created');
            return bdb.getDbNameByIndex.call(0);
        }).then(function (result) {
            assert.equal(result, 'db1', 'Db has name "db1"');
        });
    });

    it("Check column types", function () {
        return BlockchainDB.deployed().then(function () {
            return bdb.checkDataType.call('int');
        }).then(function (result) {
            assert.equal(result, true, 'Int column type was added during contract deployment');
            return bdb.checkDataType.call('array');
        }).then(function (result) {
            assert.equal(result, false, 'Array column type was not added');
            return bdb.addDataType('array');
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'DataTypeAdded');
            assert.equal(result.logs[0].args.dataType, 'array');
            return bdb.addDataType('json');
        }).then(function (result) {
            return bdb.checkDataType.call('array');
        }).then(function (result) {
            assert.equal(result, true, 'Array column type was added');
        });
    });

    it("Create other DB", function () {
        return BlockchainDB.deployed().then(function () {
            return bdb.createDb('db2', {from: accounts[1]});
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'DbCreated');
            assert.equal(result.logs[0].args.name, 'db2');
            return bdb.getDbsCount.call();
        }).then(function (result) {
            assert.equal(result.toNumber(), 2, '2 Db was created');
            return bdb.getDbData.call('db2');
        }).then(function (result) {
            assert.equal(result[0], 'db2', 'Db has name "db2"');
            assert.equal(result[1], accounts[1], '"db2" owner is ' + accounts[1]);
            assert.isTrue(result[2].toNumber() > 0, '`Created at` must be bigger than zero');
            assert.equal(result[3].toNumber(), 0, 'DB must have 0 tables');
        });
    });

    it("Init table", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.initTable('db1', 'table1', {from: accounts[0]});
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'TableInited');
            assert.equal(result.logs[0].args.id.valueOf(), 0);
            assert.equal(result.logs[0].args.dbName, 'db1');
            assert.equal(result.logs[0].args.name, 'table1');
            assert.equal(result.logs[0].args.owner, accounts[0]);
        });
    });

    it("Init other table", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.initTable('db1', 'table2', {from: accounts[0]});
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'TableInited');
            assert.equal(result.logs[0].args.id.valueOf(), 1);
            assert.equal(result.logs[0].args.dbName, 'db1');
            assert.equal(result.logs[0].args.name, 'table2');
            assert.equal(result.logs[0].args.owner, accounts[0]);
        });
    });

    it("Init 3rd table", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.initTable('db2', 'table1', {from: accounts[0]});
        }).then(function(result) {
            assert.equal(result.logs[0].event, 'TableInited');
            assert.equal(result.logs[0].args.id.valueOf(), 2);
            assert.equal(result.logs[0].args.dbName, 'db2');
            assert.equal(result.logs[0].args.name, 'table1');
            assert.equal(result.logs[0].args.owner, accounts[0]);
            return bdb.getDbData.call('db1');
        }).then(function (result) {
            assert.equal(result[3].toNumber(), 2, '"db1" must have 2 tables');
            return bdb.getDbData.call('db2');
        }).then(function (result) {
            assert.equal(result[3].toNumber(), 1, '"db2" must have 1 table');
        });
    });

    it("Get table id", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.getTableId.call('db1', 'table1');
        }).then(function (result) {
            assert.equal(result.toNumber(), 0, '"db1" must have id = 0');
        });
    });

    it("Get tables count", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.getTablesCount.call();
        }).then(function (result) {
            assert.equal(result.toNumber(), 3, 'Tables count must be 3');
        });
    });

    it("Get table data", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.getTableData.call(0);
        }).then(function (result) {
            assert.equal(result[0].valueOf(), 'db1', 'Table\'s db must be "db1"');
            assert.equal(result[1].valueOf(), 'table1', 'Table\'s name must be "table1"');
            assert.equal(result[2].valueOf(), accounts[0], 'Table\'s owner must be ' + accounts[0]);
            assert.isTrue(result[3].toNumber() > 0, 'Table\'s block inited must be gt 0');
            assert.equal(result[4].toNumber(), 0, 'Table\'s block created must be eq 0');
            assert.equal(result[5].toNumber(), 0, 'Table must has 0 columns');
        });
    });

    it("Add columns to table", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.addColumn(0, 'id', 'int', false, true, true);
        }).then(function (result) {
            return bdb.getTableData.call(0);
        }).then(function (result) {
            assert.equal(result[5].toNumber(), 1, 'Table must has 1 column');
            return bdb.addColumn(0, 'payload', 'string', true, false, false);
        }).then(function (result) {
            return bdb.getTableData.call(0);
        }).then(function (result) {
            assert.equal(result[5].toNumber(), 2, 'Table must has 2 columns');
        });
    });

    it("Create table", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.createTable(0);
        }).then(function(result) {
            assert.equal(result.logs[0].event, 'TableCreated');
            assert.equal(result.logs[0].args.id.toNumber(), 0);
            return bdb.getTableData.call(0);
        }).then(function (result) {
            assert.isTrue(result[4].toNumber() > 0, 'Table\'s block created must be gt 0');
            assert.equal(result[5].toNumber(), 2, 'Table must has 2 columns');
        });
    });

    it("Get columns data", function() {
        return BlockchainDB.deployed().then(function () {
            return bdb.getColumnData.call(0, 0);
        }).then(function (result) {
            assert.equal(result[0], 'id', 'Column\'s name must be "id"');
            assert.equal(result[1], 'int', 'Column\'s dataType must be "int"');
            assert.equal(result[2], false, 'Column must be not nullable');
            assert.equal(result[3], true, 'Column must be unique');
            assert.equal(result[4], true, 'Column must be primary key');
            return bdb.getColumnData.call(0, 1);
        }).then(function (result) {
            assert.equal(result[0], 'payload', 'Column\'s name must be "payload"');
            assert.equal(result[1], 'string', 'Column\'s dataType must be "string"');
            assert.equal(result[2], true, 'Column must be nullable');
            assert.equal(result[3], false, 'Column must not be unique');
            assert.equal(result[4], false, 'Column must not be primary key');
        });
    });

    it("Insert", function() {
        var infohash = '0x1234567890123456789012345678901234567890';
        return BlockchainDB.deployed().then(function () {
            return bdb.insert(0, infohash);
        }).then(function (result) {
            assert.equal(result.logs[0].event, 'Inserted');
            assert.equal(result.logs[0].args.tableId.toNumber(), 0);
            assert.equal(String(result.logs[0].args.infohash), infohash);
        });
    });

    //TODO error add dataTypes with empty name
    //TODO error add dataTypes not by contract owner
    //TODO error add dataTypes with already existed name

    //TODO error add db with empty name
    //TODO error add already existed db

    //TODO error init table with empty name
    //TODO error init already existed table
    //TODO error init table to not existed DB
    //TODO error init table to existed private DB
    //TODO error create table without primary key(s)
    //TODO error create table not by owner
    //TODO error create already created table
    //TODO error create not inited table

    //TODO error add column with empty name
    //TODO error add columns to table not by owner
    //TODO error add PK column without unique flag
    //TODO error add unique(PK too, see above) column with nullable flag
    //TODO error add column with wrong type

    //TODO error insert into non-existed table
    //TODO error insert into isProtected table

});

