const wm = require('./wm');
const e = require('./wm/events');

const sceneConfig = require('./scene-config');

module.exports = async obs => {

  for (const sourceConfig of sceneConfig) {
    const resp = await obs.send('GetSceneItemProperties', {
      item: sourceConfig.sourceName
    });
    sourceConfig.visible = resp.visible;

    sourceConfig.settings = await obs.send('GetSourceSettings', {
      sourceName: sourceConfig.sourceName
    });
    console.log(sourceConfig.settings);
  }


  wm.on(e.ACTIVE_WINDOW_CHANGE, (window) => {
    console.log(`Active window changed to ${window.id}; class: ${window.get('className')}`);
    updateSourcesForWindow(window);
  });

  wm.on(e.WINDOW_TITLE_CHANGE, (title, window) => {
    console.log(`Title changed to "${title}`);
    updateSourcesForWindow(window);
  });

  async function updateSourcesForWindow (window) {
    for (const source of sceneConfig) {
      const isVisible = getVisibility(source, window);
      if (isVisible !== source.visible) {
        await obs.send('SetSceneItemProperties', {
          item   : source.sourceName,
          visible: isVisible
        });
        source.visible = isVisible;
      }
      if (isVisible && source.setFromTitle) {
        source.settings = await obs.send('SetSourceSettings', {
          sourceName    : source.sourceName,
          sourceSettings: {
            window: source.settings.sourceSettings.window.replace(/^(.*)(:.+:[^:]+)$/, (_, pre, tail) => {
              const r = window.get('title').replace(/:/g, '#3A') + tail;
              console.log(`"${pre}" "${tail}"\n -> "${r}"`);
              return r;
            })
          }
        });

      }
    }
  }
};


function getVisibility (source, window) {
  for (const predicate of source.visibleWhen) {
    if (window.get('title').includes(predicate)) {
      source.shouldSetTitle = predicate;
      return true;
    }
  }
  return false;
}
