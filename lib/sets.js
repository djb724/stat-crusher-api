const _ = require('underscore');

const util = require('./util');
const {getRawPokemonData} = require('./raw');
const similarItems = require('../data/similar-items');

function getSetsData(time, format, species, cb) {
  util.cacheGetOrCalculateAndSet(`${time}:${format}:${species}:sets`, (cb) => {
    getRawPokemonData(time, format, species, (err, data) => {
      const count = data['Raw count'];
      cb(null, {
        moves:  getMoveDistribution(data.Moves),
        items: getItemDistribution(data.Items),
        abilities: getDistribution(data.Abilities),
        usage: data.usage
      })
    })
  }, 3600, cb);
}

function getDistribution(data) {
  const keys = _.sortBy(_.keys(data), i => -data[i]);

  let total = 0;
  for (let i of keys) {
    total += data[i];
  }

  return keys.map(k => ({value: k, usage: data[k] / total}));
}

function getMoveDistribution(data) {
  const keys = _.sortBy(_.keys(data), i => -data[i]);

  let total = 0;
  for (let i of keys) {
    total += data[i];
  }

  return keys.map(k => ({value: k, usage: 4 * data[k] / total}));
}

function getItemDistribution(data) {
  data = groupSimilarItems(data);
  const keys = _.sortBy(Object.keys(data), i => -data[i]);

  let total = 0;
  for (let i of keys) {
    total += data[i];
  }
  return keys.map(k => ({value: k, usage: data[k] / total}));
}

function groupSimilarItems(data) {
  const items = Object.keys(data);
  let alias, amount;
  return items.reduce((memo, item) => {
    alias = similarItems[item];
    amount = data[item];
    if (alias) {
      return util.addDataToDistribution(memo, alias, amount);
    } else {
      return util.addDataToDistribution(memo, item, amount);
    }
  }, {})
}


module.exports = { getSetsData }
