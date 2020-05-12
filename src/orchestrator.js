const e = require('./wm/events');

class Orchestrator {
  constructor (obs, wm, frames) {
    this.obs = obs;
    this.wm = wm;
    this.frames = frames;
  }

  async init () {
    this.wm.on(e.ACTIVE_WINDOW_CHANGE, (window) => this.update(window));
    this.wm.on(e.WINDOW_TITLE_CHANGE, (title, window) => this.update(window));

    const requests = this.frames.map(async frame => {
      await Promise.all([
        this.fetchData(frame, 'SceneItemProperties', {
          item: frame.destination
        }),
        this.fetchData(frame, 'SourceSettings', {
          sourceName: frame.destination
        }),
      ]);

      frame.init && await frame.init(this);

      console.log(`${frame.destination} done.`);
    });

    await Promise.all(requests);

    this.update(this.wm.getCurrentWindow());
  }

  async fetchData (frame, dataId, ...args) {
    if (!frame.remote) frame.remote = {};

    try {
      return frame.remote[dataId] = await this.obs.send('Get' + dataId, ...args);
    } catch (err) {
      console.error('Errored frame:', frame);
      throw err;
    }
  }

  update (window) {
    this.prev = this.curr;
    this.curr = window;

    for (const frame of this.frames) {
      this.updateFrame(frame).catch((err) => {
        err;
        console.error(err);
      });
    }
  }

  async updateFrame (frame) {
    const promises = [];
    const isActive = await this.runPredicate(frame);

    if (isActive) {
      promises.push(this.setDestination(frame));
    }

    if (typeof frame.active === 'undefined' || frame.active !== isActive) {
      if (isActive) {
        frame.onActive && await frame.onActive(this.curr, this);
      } else {
        frame.onRelease && await frame.onRelease(this.curr, this);
      }
      frame.active = isActive;
    }

    if (frame.hide) {
      promises.push(this.setFrameVisibility(frame, isActive));
    }

    return Promise.all(promises);
  }

  async runPredicate(frame) {
    if (typeof frame.predicate === 'function') {
      return await frame.predicate(this.curr, this);
    }

    const title = this.curr.get('title');

    function p (pattern) {
      if (pattern instanceof RegExp && pattern.test(title)) {
        return true;
      } else if (typeof pattern === 'string' && title.includes(pattern)) {
        return true;
      }
    }

    if (frame.title) {
      return (frame.title.oneOf  || []).some(p)
         && !(frame.title.noneOf || []).some(p);
    }

    return false;
  }

  async setDestination (frame) {
    if (frame.remote.SourceSettings.sourceType !== 'window_capture') {
      return;
    }
    const query = frame.remote.SourceSettings.sourceSettings.window;
    const window = this.curr;
    await this.obs.send('SetSourceSettings', {
      sourceName: frame.destination,
      sourceSettings: {
        window: query.replace(/^(.*)(:.+:[^:]+)$/, (_, pre, tail) => {
          return window.get('title').replace(/:/g, '#3A') + tail;
        })
      }
    });
  }

  async setFrameVisibility (frame, visible) {
    await this.obs.send('SetSceneItemProperties', {
      item   : frame.destination,
      visible
    });
  }

}


module.exports = Orchestrator;

