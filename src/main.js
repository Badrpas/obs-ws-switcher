const wm = require('./wm');
const e = require('./wm/events');
const Orchestrator = require('./orchestrator');

const sceneConfig = require('./scene-config');

module.exports = async obs => {
  const orchestrator = new Orchestrator(obs, wm, sceneConfig.frames);
  await orchestrator.init();
  return orchestrator;
};
