const ref = require('ref-napi');
const Struct = require('ref-struct-napi');
const ffi = require('ffi-napi');
const events = require('../events');
const win32def = require('win32-def');
const user32 = require('./user32');
const { WindowDescriptor, WindowManagerBase } = require('../base');

const RectType = Struct(win32def.DStruct.RECT);
const PointType = Struct(win32def.DStruct.POINT);

const STRING_MAX_LENGTH = 255;
const STRING_BUFFER = Buffer.alloc(STRING_MAX_LENGTH * 2 + 1);
const UPDATE_INTERVAL = 100;

module.exports = class extends WindowManagerBase {
  constructor () {
    super();
    this.mouse = {
      position: new PointType()
    };

    setInterval(() => this.updateMousePos(), 60);
    setInterval(() => {
      this.updateCurrentWindow();
    }, UPDATE_INTERVAL);
  }

  updateMousePos () {
    user32.GetCursorPos(this.mouse.position.ref());
  }

  updateCurrentWindow () {
    const w = this.getCurrentWindow();
    if (!this.currentWindow || w.id !== this.currentWindow.id) {
      this.emit(events.ACTIVE_WINDOW_CHANGE, w);

      this.setEvent(w, events.WINDOW_TITLE_CHANGE);
      this.currentWindow = w;
    }
  }

  setEvent (w, event) {
    this.currentWindow && this.currentWindow.off(event, this.getEventProxy(event));
    w.on(event, this.getEventProxy(event));
  }

  getCurrentWindow () {
    const attrs = {};
    attrs.handle = user32.GetForegroundWindow();

    user32.GetWindowTextW(attrs.handle, STRING_BUFFER, STRING_MAX_LENGTH);
    // attrs.title = ref.readCString(STRING_BUFFER);
    attrs.title = STRING_BUFFER.toString('utf16le').replace(/\0+$/, '');

    STRING_BUFFER.fill(0);
    let r = user32.GetClassNameW(attrs.handle, STRING_BUFFER, STRING_MAX_LENGTH);
    attrs.className = STRING_BUFFER.toString('utf16le').replace(/\0+$/, '');

    attrs.rect = new RectType();
    user32.GetWindowRect(attrs.handle, attrs.rect.ref());

    return WindowDescriptor.getInstance(attrs.handle, attrs);
  }
};
