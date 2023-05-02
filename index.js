'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const request = require('request');
const async = require('async');
const boom = require('@hapi/boom');

const app = express();
let routers = require('./routers');

app.use(bodyParser.json());
app.use('/v1', routers.v1);
app.use('/v2', routers.v2);

// Handle Errors
app.use('/', (err, req, res, next) => {
  if (!err) {
      res.status(404).send('Endpoint not found')
  }
  console.error(err.stack);
  res.status(500).send(err.stack);
  next();
})


app.listen(8080, (err) => {
  if (err) console.log('An error occured');
  else console.log('Listening on port 8080');
});
