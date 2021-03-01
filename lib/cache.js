const redis = require('redis');

module.exports = class Cache {
  'use strict';

  static #instance = redis.createClient();
  constructor() { }

  static getInstance() {
    return Cache.#instance;
  }
}
