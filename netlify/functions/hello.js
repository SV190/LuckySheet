const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/', (req, res) => {
  res.json({
    message: "Hello from Netlify Functions!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

module.exports.handler = serverless(app); 