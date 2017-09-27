const Db = require('./db.js');

const App = function(contract, config) {
    const app = {};
    const db = Db(contract);

    Object.keys(db).forEach(function(key) {console.log(key)});

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
        db.createDb(name, {from: config.address, gas: 150000})
            .then(result => res.json({success: 'ok', result: result}))
            .catch(err => {res.json({success: 'error', error: err.message})});
    };

    return app;
};

module.exports = App;