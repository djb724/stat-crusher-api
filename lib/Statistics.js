const _ = require('underscore');

function mean(data) {
  let total = 0;
  let totalQty = 0;
  for (let [value, freq] of Object.entries(data)) {
    total += value * freq;
    totalQty += freq;
  }
  return total / totalQty;
}

function median(data, total = 0) {
  return percentile(50, data, total);
}

function percentile(p, data, total = 0) {
  const values = Object.keys(data).sort((a, b) => +a < +b);
  if ((p < 0) || (p > 100)) return undefined;
  p = p / 100;

  if (!total) {
    total = 0;
    for (let v of values) {
      total += data[v];
    }
  }

  let cumulative = 0;
  for (let v of values) {
    cumulative += data[v];
    if (cumulative / total >= p)
      return v
  }
  return _.last(values);
}

module.exports = {
  mean,
  median,
  percentile
}
