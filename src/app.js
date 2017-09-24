var config = require('../config.js');
var express = require('express');
var fs = require('fs');
var Web3 = require('web3');
var TruffleContract = require('truffle-contract');

var app = express();
var router = express.Router();

var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));
config.address = web3.eth.accounts[0]; // get 0th acc as default

var contractArtifact = JSON.parse(fs.readFileSync('build/contracts/bcSQL.json'));
var contract = TruffleContract(contractArtifact);
contract.setProvider(web3.currentProvider);


// Router middleware, mentioned it before defining routes.
router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});


router.get("/getBalance", function(req, res, next) {
    var balance = web3.eth.getBalance(config.address);
    res.json({balance: web3.fromWei(balance).toNumber()});
});

router.get("/getDbsCount", function(req, res, next) {
    contract.deployed().then(function(instance) {
        return instance.getDbsCount.call();
    }).then(function(result) {
        res.json({count: result.toNumber()});
    }).catch(function(err) {
        res.json({error: err});
        console.error(err);
    });
});

router.get('/getDbNameByIndex/:index', function(req, res, next) {
    contract.deployed().then(function(instance) {
        return instance.getDbNameByIndex.call(Number(req.params.index));
    }).then(function(result) {
        console.log(result);
        res.json({name: result});
    }).catch(function(err) {
        res.json({error: err});
        console.error(err);
    });
});

router.get("/createDb/:name", function(req, res, next) {
    var name = req.params.name;
    if (name.length == 0) {
        res.json({error: 'Db name cant be empty'});
        return;
    }

    var c;
    contract.deployed().then(function(instance) {
        c = instance;
        return c.createDb(name, {from: config.address, gas: 150000});
    }).then(function(result) {
        if (result.logs.some(function(item) {return 'mined' == item.type && 'DbCreated' == item.event && item.args.name == name;})) {
            res.json({result: 'ok'});
        } else {
            res.json({error: 'Got no event `DbCreated` with name `' + name + '` from blockchain'});
        }
    }).catch(function(err) {
        res.json({error: err});
    });
});

router.get("/getDbData/:name", function(req, res, next) {
    var name = req.params.name;
    if (name.length == 0) {
        res.json({error: 'Db name cant be empty'});
        return;
    }

    contract.deployed().then(function(instance) {
        return instance.getDbData.call(name);
    }).then(function(result) {
        res.json({data: result});
        console.log(result);
    }).catch(function(err) {
        res.json({error: err});
        console.error(err);
    });
});

// Tell express to use this router with /api before.
// You can put just '/' if you don't want any sub path before routes.
app.use('/api', router);

// Handle 404 error.
// The last middleware.
app.use("*",function(req,res){
    res.status(404).send('404');
});

// Listen to this Port
app.listen(3000, function(){
    console.log("Live at Port 3000");
});