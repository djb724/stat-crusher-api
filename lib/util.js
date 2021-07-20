const cache = require('./cache.js').getInstance();

function cacheGetOrCalculateAndSet(key, calculateFunction, expires = 3600, cb) {
  cache.get(key, (err, data) => {
    if (err) cb(err);
    if (data) {
      console.log(`Key ${key} found in cache`);
      const dataObj = JSON.parse(data);
      cb(null, dataObj);
    } else {
      console.log(`Key ${key} not found in cache, fetching data`);
      calculateFunction((err, data) => {
        if (err) return cb(err);
        cache.setex(key, expires, JSON.stringify(data), (err) => {
          if (err) return cb(err);
          cb(null, data);
        })
      })
    }
  })
}

function addDataToDistribution(dist, value, amount) {
  if (dist.hasOwnProperty(value)) {
    dist[value] += amount;
  } else {
    dist[value] = amount;
  }
  return dist;
}


module.exports = {
  cacheGetOrCalculateAndSet,
  addDataToDistribution
};
