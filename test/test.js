const Scan = require('../index.js');
const path = require('path');
Scan({
  dir: [path.resolve(__dirname, './test-directory')]
}, data => console.log("Async Callback call: ", data.join()));

Scan({
  dir: path.resolve(__dirname, './test-directory')
}).then(data => console.log("Async Promise call: ", data.join()));

console.log("Sync call: ", Scan({
  dir: path.resolve(__dirname, './test-directory'),
  sync: true,
  appendAscii: false
}).join());