'use strict';

const express = require('express');
const redis = require('redis');
const request = require('request');
const async = require('async');
const boom = require('@hapi/boom');

const app = express();
const cache = require('./lib/cache').getInstance();
const {getRawPokemonData, getRawFormatData} = require('./lib/raw');
const {getStatsData} = require('./lib/stats');
const {getUsageData} = require('./lib/usage');
const {getSetsData} = require('./lib/sets');

app.use('/v1/', (req, _, next) => {
  console.log("Received request for " + req.url);
  next();
})

app.use('/v1/', (_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
})

app.get("/v1/:time/:format/raw", (req, res, next) => {
  let {time, format} = req.params;
  getRawFormatData(time, format, (err, data) => {
    if (err) next(err);
    res.send(data);
  })
})

app.get("/v1/:time/:format/usage", (req, res, next) => {
  const {time, format} = req.params;
  getUsageData(time, format, (err, data) => {
    if (err) next(err);
    res.send(data);
  })
})

app.get("/v1/:time/:format/pokemon/:species/raw", (req, res, next) => {
  let {time, format, species} = req.params;
  getRawPokemonData(time, format, species, (err, data) => {
    if (err) next(err);
    res.send(data);
  })
})

app.get("/v1/:time/:format/pokemon/:species/stats", (req, res, next) => {
  let {time, format, species} = req.params;
  getStatsData(time, format, species, (err, data) => {
    if (err) return next(err);
    res.send(data);
  })
})

app.get("/v1/:time/:format/pokemon/:species/sets", (req, res, next) => {
  let {time, format, species} = req.params;
  getSetsData(time, format, species, (err, data) => {
    if (err) next(err);
    res.send(data);
  })
})

app.get("/v1/:time/:format/pokemon/:species/complete", (req, res, next) => {
  let {time, format, species} = req.params;
  async.parallel({
    stats: cb => getStatsData(time, format, species, cb),
    sets: cb => getSetsData(time, format, species, cb)
  }, (err, results) => {
    if (err) next(err);
    res.send(Object.assign(results.sets, results.stats));
  })
})

// Handle Errors
app.use('/', (err, req, res, next) => {
  if (!err) {
    res.status(404).send('Endpoint not found')
  }
  console.error(err);
  err = boom.boomify(err);
  res.status(err.statusCode).send(err);
  next();
})

app.listen(8080, (err) => {
  if (err) console.log('An error occured');
  else console.log('Listening on port 8080');
});
