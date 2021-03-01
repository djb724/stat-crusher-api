const cache = require('./cache').getInstance();
const async = require('async');
const request = require('request');
const boom = require('@hapi/boom');

const util = require('./util');

function getRawFormatData_old(time, format, cb) {
  console.log(`Getting data from ${format} in ${time}`);
  const cacheKey = `${time}:${format}:raw`;
  cache.get(cacheKey, (err, data) => {
    if (err) return cb(err);
    if (data) {
      console.log('Format data found in cache')
      cb(null, JSON.parse(data));
    } else {
      const requestUrl = `https://smogon.com/stats/${time}/chaos/${format}.json`;
      console.log("Sending request for " + requestUrl + ".");
      request.get(requestUrl, (err, response, body) => {
        try {
          cache.setex(cacheKey, 86400, body, (err) => {
            if (err) return cb(err);
            cb(null, JSON.parse(body));
          })
        } catch (err) {
          return cb(err);
        }
      })
    }
  })
}

function getRawFormatData(time, format, cb) {
  console.log(`Getting data from ${format} in ${time}`);
  util.cacheGetOrCalculateAndSet(`${time}:${format}:raw`, (cb) => {
    const requestUrl = `https://smogon.com/stats/${time}/chaos/${format}.json`;
    console.log("Sending request for " + requestUrl + ".");
    request.get(requestUrl, (err, response, body) => {
      console.log("Received response " + response.statusCode);
      const resObj = JSON.parse(body);
      cb(null, resObj);
    })
  }, 86400, cb)
}

function getRawPokemonData_old(time, format, species, cb) {
  console.log(`Getting data for ${species} from ${format} in ${time}`);
  const cacheKey = `${time}:${format}:${species}:raw`
  cache.get(cacheKey, (err, data) => {
    if (err) return cb(err);
    if (data) {
      console.log('Pokemon data found in cache')
      cb(null, JSON.parse(data));
    } else {
      getRawFormatData(time, format, (err, data) => {
        if (err) return (err);
        data = data.data;
        if (!data.hasOwnProperty(species)) return cb(boom.notFound('Species not found'));
        cache.setex(cacheKey, 3600, JSON.stringify(data[species]), (err) => {
          if (err) return cb(err);
          cb(null, data[species]);
        })
      })
    }
  })
}

function getRawPokemonData(time, format, species, cb) {
  console.log(`Getting data for ${species} from ${format} in ${time}`);
  util.cacheGetOrCalculateAndSet(`${time}:${format}:${species}:raw`, (cb) => {
    getRawFormatData(time, format, (err, data) => {
      if (err) return (err);
      console.log(Object.keys(data));
      data = data.data;
      if (!(data.hasOwnProperty(species))) return cb(boom.notFound('Species not found'));
      cb(null, data[species]);
    })
  }, 3600, cb);
}

module.exports = {
  getRawPokemonData,
  getRawFormatData
}
