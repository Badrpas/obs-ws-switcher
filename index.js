require('dotenv').config();
const OBSWebSocket = require('obs-websocket-js');

const obs = new OBSWebSocket();

obs.connect({
  password: process.env.OBS_WS_PASSWORD
}).then(() => {
  return require('./src/main')(obs);
}).catch(err => {
  console.error(err);
});
