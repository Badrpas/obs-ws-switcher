const { WINDOW_TITLE_CHANGE } = require('./events');
const { EventEmitter } = require('events');
const memoize = require('lodash/memoize');

class WindowManagerBase extends EventEmitter {
  constructor () {
    super();
    this.getEventProxy = memoize(this.getEventProxy);
  }

  getCurrentWindow () {
    throw new Error('Not implemented');
  }

  getEventProxy(event) {
    return (...args) => this.emit(event, ...args);
  }
}


class WindowDescriptor extends EventEmitter {
  constructor (id, attrs) {
    super();
    this.id = id;
    this.setAttrs(attrs);
  }

  setAttrs(attrs = {}) {
    if (!this.attrs) this.attrs = {};
    for (const [key, value] of Object.entries(attrs)) {
      this.set(key, value);
    }
  }

  get (key) {
    return this.attrs[key];
  }

  set (key, val) {
    if (this.get(key) === val) return;

    this.attrs[key] = val;
    if (key === 'title') {
      this.emit(WINDOW_TITLE_CHANGE, val, this);
    }
  }

  static getInstance (id, attrs) {
    if (!this.instances) this.instances = {};

    const existing = this.instances[id];
    if (existing) {
      existing.setAttrs(attrs);
      return existing;
    }

    const instance = new this(id, attrs);
    this.instances[id] = instance;
    return instance;
  }
}


module.exports = {
  WindowManagerBase,
  WindowDescriptor,
};
