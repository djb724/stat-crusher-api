const express = require('express');
const admin = require('./admin');
const cache = require('../lib/cache').getInstance();

let router = express.Router();
router.use('/admin', admin);

router.get('/:elo/usage', (req, res, next) => {
  const {time, format, elo} = req.params;
  cacheKey = `${elo}:usage`;
  cache.get(cacheKey, (err, data) => {
    if (err) return next(err);
    if (data === '') return next(boom.notFound());
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  })
})

router.get('/:elo/pokemon/:pokemon', (req, res, next) => {
  const {time, format, elo, pokemon} = req.params;
  let cacheKey = `${elo}:pokemon:${pokemon}`;
  cache.get(cacheKey, (err, data) => {
    if (err) return next(err);
    if (data === '') return next(boom.notFound());
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  })
})

module.exports = router;
