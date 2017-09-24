var bcSQL = artifacts.require("./bcSQL.sol");

module.exports = function(deployer) {
    deployer.deploy(bcSQL);
};