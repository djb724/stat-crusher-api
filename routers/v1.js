const async = require('async');
const express = require('express');
const cache = require('../lib/cache').getInstance();
const {getRawPokemonData, getRawFormatData} = require('../lib/raw');
const {getStatsData} = require('../lib/stats');
const {getUsageData} = require('../lib/usage');
const {getSetsData} = require('../lib/sets');

let router = express.Router();

router.use('', (req, _, next) => {
    console.log("Received request for " + req.url);
    next();
})

router.use('', (_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

router.get("/:time/:format/raw", (req, res, next) => {
    let { time, format } = req.params;
    getRawFormatData(time, format, (err, data) => {
        if (err) next(err);
        res.send(data);
    })
})

router.get("/:time/:format/usage", (req, res, next) => {
    const { time, format } = req.params;
    getUsageData(time, format, (err, data) => {
        if (err) next(err);
        res.send(data);
    })
})

router.get("/:time/:format/pokemon/:species/raw", (req, res, next) => {
    let { time, format, species } = req.params;
    getRawPokemonData(time, format, species, (err, data) => {
        if (err) next(err);
        res.send(data);
    })
})

router.get("/:time/:format/pokemon/:species/stats", (req, res, next) => {
    let { time, format, species } = req.params;
    getStatsData(time, format, species, (err, data) => {
        if (err) return next(err);
        res.send(data);
    })
})

router.get("/:time/:format/pokemon/:species/sets", (req, res, next) => {
    let { time, format, species } = req.params;
    getSetsData(time, format, species, (err, data) => {
        if (err) next(err);
        res.send(data);
    })
})

router.get("/:time/:format/pokemon/:species/complete", (req, res, next) => {
    let { time, format, species } = req.params;
    async.parallel({
        stats: cb => getStatsData(time, format, species, cb),
        sets: cb => getSetsData(time, format, species, cb)
    }, (err, results) => {
        if (err) next(err);
        res.send(Object.assign(results.sets, results.stats));
    })
})

// Handle Errors
router.use('/', (err, req, res, next) => {
    if (!err) {
        res.status(404).send('Endpoint not found')
    }
    console.error(err.stack);
    res.status(500).send(err.stack);
    next();
})


module.exports = router;