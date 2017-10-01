pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract bcSQL is Ownable
{
    struct Db {
        uint256 id;
        string name;
        address owner;
        uint256 createdAt;
        mapping(string => Table) tables;
        string[] tableNames;
//		bool isProtected;
//		address[] admins;
    }

    struct Table {
        uint256 id;
        Db db;
        string name;
        address owner;
        uint256 initedAt;
        uint256 createdAt;
        mapping(string => Column) columns;
        string[] columnNames;
//		bool isProtected;
//		address[] admins;
    }

    struct Column {
        Table table;
        string name;
        string dataType;
        bool nullable;
		bool unique;
        bool isPrimaryKey;
    }

	mapping (string => Db) dbs;
	Table[] tables;
	string[] dbNames;
	mapping(string => uint256) dataTypes;

	event DataTypeAdded(string dataType);
	event DbCreated(uint256 id, string name);
	event TableInited(uint256 id, string dbName, string name, address owner, uint256 initedAt);
	event TableCreated(uint256 id);
	event Inserted(uint256 tableId, bytes20 infohash);

	// construct

	function bcSQL()
	{
		dataTypes['int'] = block.number;
		dataTypes['bool'] = block.number;
		dataTypes['float'] = block.number;
		dataTypes['string'] = block.number;
	}

	// Data types

	function checkDataType(string $dataType) constant public returns (bool)
	{
		return dataTypes[$dataType] > 0 && block.number > dataTypes[$dataType];
	}

	function addDataType(string $dataType) onlyOwner public
	{
		require(bytes($dataType).length > 0);
		require(dataTypes[$dataType] == 0);
		dataTypes[$dataType] = block.number;
		DataTypeAdded($dataType);
	}

	// DBs

	function createDb(string $dbName) public
	{
		require(bytes($dbName).length > 0);
		Db storage $Db = dbs[$dbName];
	    require($Db.createdAt == 0);

        $Db.id = dbNames.push($dbName) - 1;
	    $Db.name = $dbName;
		$Db.owner = msg.sender;
		$Db.createdAt = block.number;

		DbCreated($Db.id, $dbName);
	}

	function getDbsCount() constant public returns (uint256 _dbsCount)
	{
	    return dbNames.length;
	}

	function _getDb(string $name) constant internal returns (Db storage)
	{
		Db storage $Db = dbs[$name];
		require ($Db.createdAt != 0);

		return $Db;
	}

	function getDbNameByIndex(uint256 $index) constant public returns (string _dbName)
	{
	    return dbNames[$index];
	}

	function getDbData(string $dbName) constant public returns (uint256 id, string _dbName, address _dbOwner, uint256 _dbCreatedAt, uint256 _tablesCount)
	{
	    var $Db = _getDb($dbName);
	    return ($Db.id, $Db.name, $Db.owner, $Db.createdAt, $Db.tableNames.length);
	}

	// Tables

	function initTable(string $dbName, string $tableName) public
	{
		require(bytes($tableName).length > 0);
		Db storage $Db = _getDb($dbName);

		Table storage $Table = $Db.tables[$tableName];
		require($Table.initedAt == 0);

		var $id = tables.push($Table) - 1;
        tables[$id].id = $id;
        tables[$id].db = $Db;
        tables[$id].name = $tableName;
        tables[$id].owner = msg.sender;
        tables[$id].initedAt = block.number;

		$Db.tableNames.push($tableName);

		// memory leaks here?
        $Table.db = $Db;
		$Table.name = $tableName;
		$Table.id = $id;
		$Table.owner = msg.sender;
		$Table.initedAt = block.number;

		TableInited($id, $Db.name, $Table.name, $Table.owner, $Table.initedAt);
	}

	function _getTableByName(string $dbName, string $tableName) constant internal returns (Table storage)
	{
		var $Db = _getDb($dbName);
		Table storage $Table = $Db.tables[$tableName];
		require($Table.initedAt != 0);
		return $Table;
	}

    function getTableId(string $dbName, string $tableName) constant public returns (uint256 id)
    {
        var $Db = _getDb($dbName);
        Table storage $Table = $Db.tables[$tableName];
        require($Table.initedAt != 0);
        return $Table.id;
    }

	function _getTable(uint256 $tableId) constant internal returns (Table storage)
	{
		Table storage $Table = tables[$tableId];
		require($Table.initedAt != 0);
		return $Table;
	}

    function getTableData(uint256 $tableId) constant public returns (string db, string name, address owner, uint256 initedAt, uint256 createdAt, uint256 columnsCount)
    {
        var $Table = _getTable($tableId);
        return ($Table.db.name, $Table.name, $Table.owner, $Table.initedAt, $Table.createdAt, $Table.columnNames.length);
    }

    function getTablesCount() constant public returns (uint256)
    {
        return tables.length;
    }

	function createTable(uint256 $id) public
	{
		var $Table = _getTable($id);
		require(0 == $Table.createdAt);
		require(msg.sender == $Table.owner);

        bool $hasPrimaryKeys = false;
        for (uint16 $i = 0; $i < $Table.columnNames.length; $i++) {
            if ($Table.columns[$Table.columnNames[$i]].isPrimaryKey) {
                $hasPrimaryKeys = true;
				break;
            }
        }
        require($hasPrimaryKeys);

		$Table.createdAt = block.number;
		TableCreated($Table.id);
	}

	// Columns

	function addColumn(uint256 $tableId, string $columnName, string $dataType, bool $nullable, bool $unique, bool $isPrimaryKey)
	{
		require(bytes($columnName).length > 0);
        require(!$isPrimaryKey || $unique);
		require(checkDataType($dataType));
		Table storage $Table = _getTable($tableId);
		require(0 == $Table.createdAt);
		require(msg.sender == $Table.owner);

        if (bytes($Table.columns[$columnName].dataType).length == 0) {
		    $Table.columnNames.push($columnName);
        }

		$Table.columns[$columnName].table = $Table;
		$Table.columns[$columnName].name = $columnName;
		$Table.columns[$columnName].dataType = $dataType;
		$Table.columns[$columnName].nullable = $nullable;
		$Table.columns[$columnName].unique = $unique;
		$Table.columns[$columnName].isPrimaryKey = $isPrimaryKey;
		// TODO add event?
	}

	function getColumnData(uint256 $tableId, uint256 $columnIndex) constant public returns (string name, string dataType, bool nullable, bool unique, bool isPrimaryKey)
	{
		var $Table = _getTable($tableId);
		var $Column = $Table.columns[$Table.columnNames[$columnIndex]];
		require(bytes($Column.dataType).length != 0);
		return ($Column.name, $Column.dataType, $Column.nullable, $Column.unique, $Column.isPrimaryKey);
	}

	// ***
	// Data manipulation
	// **

	// Insert

	function insert (uint256 $tableId, bytes20 $infohash) public
	{
		var $Table = _getTable($tableId);
		require($Table.createdAt != 0);
		Inserted($tableId, $infohash);
	}
}
//TODO private DBs, without public name, but with public hash(name)
