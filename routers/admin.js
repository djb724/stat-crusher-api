const async = require('async');
const boom = require('@hapi/boom');
const express = require('express');
const request = require('request');
const _ = require('underscore');

const { calculateStatsData, calculateStatsDataSync } = require('../lib/stats');
const { getDistribution, getMoveDistribution, getItemDistribution } = require('../lib/sets')
const cache = require('../lib/cache').getInstance();

const elos = [0, 1500, 1630, 1760];

module.exports = express.Router()
  .use('', (req, res, next) => {
    console.log(req.headers);
    if (req.headers['authorization'] === 'Fw73WhQKC31QB0GRv0th') {
      return next()
    }
    next(boom.forbidden());
  })
  .post('/update', (req, res, next) => {
    console.log(req.body)
    const { time, format } = req.body;
    if (!time) return boom.badRequest('Missing time parameter');
    if (!format) return boom.badRequest('Missing format parameter');

    async.autoInject({
      current: (cb) => {
        cache.get('latest', (err, data) => {
          if (err) return cb(err);
          if (!data) return cb(null);
          let [currentTime, currentFormat] = data.split(',');
          //if (currentTime === time && currentFormat === format) return cb(boom.badRequest('Already up to date'));
          cb(null, { time: currentTime, format: currentFormat })
        });
      },
      getAndStoreData: (current, cb) => {
        async.map(elos, (elo, cb) => getUsageData(time, format, elo, cb), cb)
      },
      setCurrent: (current, getAndStoreData, cb) => {
        cache.set('latest', `${time},${format}`, cb);
      }
    }, (err) => {
      if (err) return next(boom.badImplementation(err));
      res.send({
        message: 'Success'
      });
    })
  })

function getUsageData(time, format, elo, cb) {
  async.autoInject({
    rawFormatData: (cb) => {
      const requestUrl = `https://smogon.com/stats/${time}/chaos/${format}-${elo}.json`;
      console.log("Sending request for " + requestUrl + ".");
      request.get(requestUrl, (err, response, body) => {
        console.log("Received response " + response.statusCode);
        if (err) return cb(err);
        if (response.statusCode != 200) return cb(boom.notFound("JSON file not found"));
        let resObj;
        try {
          resObj = JSON.parse(body);
        } catch {
          return cb(boom.expectationFailed("Invalid JSON from request"))
        }
        cb(null, resObj);
      })
    },
    pokemonList: (rawFormatData, cb) => {
      let data = rawFormatData.data;
      return cb(null, _.sortBy(Object.keys(data), p => -data[p].usage))
    },
    usageData: (rawFormatData, pokemonList, cb) => {
      let rank = 0;
      let data = rawFormatData.data;
      let usageData = pokemonList.map(p => ({
        name: p,
        count: data[p]['Raw count'],
        usage: data[p].usage,
        rank: ++rank
      }))
      cache.set(`${elo}:usage`, JSON.stringify(usageData), cb);
    },
    pokemonData: (rawFormatData, pokemonList, cb) => {
      let data = rawFormatData.data;
      async.map(pokemonList, (pokemon, cb) => {
        calculateStatsData(pokemon, data[pokemon], (_err, stats) => {
          completeStats = {
            ...stats,
            moves: getMoveDistribution(data[pokemon].Moves),
            items: getItemDistribution(data[pokemon].Items),
            abilities: getDistribution(data[pokemon].Abilities),
            usage: data[pokemon].usage,
            total: data[pokemon]['Raw count']
          };
          console.log(`${elo}:pokemon:${pokemon}`);
          cache.set(`${elo}:pokemon:${pokemon}`, JSON.stringify(completeStats), cb)
        });
      }, cb)
    }
  }, cb)
}