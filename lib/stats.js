const async = require('async');
const _ = require('underscore');

const cache = require('./cache').getInstance();
const util = require('./util');
const {getRawPokemonData} = require('./raw');
const baseStatsData = require('../data/base-stats');
const natureMultipliers = require('../data/natures');
const Statistics = require('./Statistics');
const { max } = require('underscore');

const level = 50;

function getStatsData(time, format, species, cb) {
  const baseStats = baseStatsData[species];
  util.cacheGetOrCalculateAndSet(`${time}:${format}:${species}:stats`, cb => {
    getRawPokemonData(time, format, species, (err, data) => {
      let hp = {};
      let atk = {};
      let def = {};
      let satk = {};
      let sdef = {};
      let spd = {};
      let natures = {};

      let nature, evs, stats;
      let total = 0;
      for (var [spread, amount] of Object.entries(data.Spreads)) {
        total += amount;
        [nature, evs] = spread.split(':');
        evs = evs.split('/').map(n => parseInt(n));
        stats = {
          hp: calculateHP(level, baseStats.hp, evs[0]),
          atk: calculateStat(level, baseStats.atk, evs[1], natureMultipliers[nature][1], true),
          def: calculateStat(level, baseStats.def, evs[2], natureMultipliers[nature][2], false),
          satk: calculateStat(level, baseStats.satk, evs[3], natureMultipliers[nature][3], false),
          sdef: calculateStat(level, baseStats.sdef, evs[4], natureMultipliers[nature][4], false),
          spd: calculateStat(level, baseStats.spd, evs[5], natureMultipliers[nature][5], true),
        }
        util.addDataToDistribution(hp, stats.hp, amount);
        util.addDataToDistribution(atk, stats.atk, amount);
        util.addDataToDistribution(def, stats.def, amount);
        util.addDataToDistribution(satk, stats.satk, amount);
        util.addDataToDistribution(sdef, stats.sdef, amount);
        util.addDataToDistribution(spd, stats.spd, amount);
        util.addDataToDistribution(natures, nature, amount);
      }
      let finalStats = _.mapObject({hp, atk, def, satk, sdef, spd}, s => digestQuantitativeStatistics(s, total));
      finalStats.natures = digestNatures(natures, total);
      finalStats.total = total;
      cb(null, finalStats);
    })
  }, 3600, cb)
}

function calculateHP(level, baseStat, evs) {
  return 10 + level + Math.floor((2 * baseStat + 31 + Math.floor(evs / 4)) * level / 100);
}

function calculateStat(level, baseStat, evs, natureMultiplier, assumeMinIv) {
  const iv = assumeMinIv && evs === 0 && natureMultiplier === 0.9 ? 0 : 31;
  const statWithoutNature  = 5 + Math.floor((2 * baseStat + iv + Math.floor(evs / 4)) * level / 100);
  return Math.floor(natureMultiplier * statWithoutNature);
}

function digestQuantitativeStatistics(data, total) {
  data = fillWithZeroes(data);
  const values = Object.keys(data).sort((a, b) => a < b);
  return {
    raw: values.map(v => ({value: v, usage: data[v] / total})),
    cumulative: values.reduce((memo, v) => {
      memo.cumTotal += data[v];
      memo.values.push({value: v, usage: memo.cumTotal / total});
      return memo
    }, {
      cumTotal: 0,
      values: []
    }).values,
    cumulativeDesc: values.reduce((memo, v) => {
      memo.values.push({value: v, usage: memo.cumTotal / total});
      memo.cumTotal -= data[v];
      return memo
    }, {
      cumTotal: total,
      values: []
    }).values,
    mean: Statistics.mean(data),
    median: Statistics.median(data, total),
    p25: Statistics.percentile(25, data, total),
    p75: Statistics.percentile(75, data, total)
  };
}

function digestNatures(data, n) {
  data = groupNeutralNatures(data);
  return _.sortBy(Object.keys(data), r => -data[r]).map(v => ({value: v, usage: data[v] / n}));
}

function groupNeutralNatures(data) {
  const neutralNatures = ['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky'];

  return Object.keys(data).reduce((mem, nat) => {
    if (neutralNatures.includes(nat)) {
      return util.addDataToDistribution(mem, 'Neutral', data[nat]);
    } else {
      return util.addDataToDistribution(mem, nat, data[nat])
    }
  }, {});
}

function fillWithZeroes(obj) {
  const keys = Object.keys(obj).map(a => +a);
  const minValue = _.min(keys), maxValue = _.max(keys);
  for (i = minValue; i <= maxValue; i++) {
    if (!obj.hasOwnProperty(i)) {
      obj[i] = 0;
    }
  }
  return obj;
}

module.exports = {
  getStatsData
}
