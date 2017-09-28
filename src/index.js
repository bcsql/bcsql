const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));

const config = require('../config.js');
config.address = web3.eth.accounts[0]; // get 0th acc as default

const TruffleContract = require('truffle-contract');
const contractArtifact = JSON.parse(fs.readFileSync('build/contracts/bcSQL.json'));
const contract = TruffleContract(contractArtifact);
contract.setProvider(web3.currentProvider);

const Express = require('express');
const express = Express();
const router = Express.Router();

const App = require('./controllers/app.js');
const app = App(contract, config);

// Router middleware, mentioned it before defining routes.
router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});

router.get("/getBalance", function(req, res, next) {
    const balance = web3.eth.getBalance(config.address);
    res.json({balance: web3.fromWei(balance).toNumber()});
});


router.get("/getDbsCount", (req, res) => app.getDbsCount(res));
router.get('/getDbNameByIndex/:index', (req, res) => app.getDbNameByIndex(Number(req.params.index), res));
router.get("/getDbData/:name", (req, res) => app.getDbData(req.params.name, res));
router.get("/createDb/:name", (req, res) => app.createDb(req.params.name, res));

router.get('/checkDataType/:dataType', (req, res) => app.checkDataType(req.params.dataType, res));
router.get('/addDataType/:dataType', (req, res) => app.addDataType(req.params.dataType, res));


// Tell express to use this router with /api before.
// You can put just '/' if you don't want any sub path before routes.
express.use('/api', router);

// Handle 404 error.
// The last middleware.
express.use("*",function(req,res){
    res.status(404).send('404');
});

// Listen to this Port
express.listen(3000, function(){
    console.log("Live at Port 3000");
});