const _ = require('underscore');

const {getRawFormatData} = require('./raw.js');
const util = require('./util');

function calculateUsageData(time, format, cb) {
  getRawFormatData(time, format, (err, data) => {
    if (err) return cb(err);
    data = data.data;
    const pokemon = _.sortBy(Object.keys(data), p => -data[p].usage);
    let rank = 0;
    return cb(null, pokemon.map(p => ({
      name: p,
      count: data[p]['Raw count'],
      usage: data[p].usage,
      rank: ++rank
    })))
  })
}

function getUsageData(time, format, cb) {
  const cacheKey = `${time}:${format}:usage`
  util.cacheGetOrCalculateAndSet(cacheKey, cb => calculateUsageData(time, format, cb), 3600, cb);
}

module.exports = { getUsageData }
