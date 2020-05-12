const ref = require('ref-napi');
const ffi = require('ffi-napi');
const win32def = require('win32-def');
const { User32 } = require('win32-api');

const int = 'int';

const user32 = User32.load();

ffi.Library(User32.dllName, {
  GetWindowTextA: ['int', [win32def.DTypes.HWND, win32def.DTypes.LPSTR, int]],
  GetClassNameW: ['int', [win32def.DTypes.HWND, win32def.DTypes.LPWSTR, int]],
  GetCursorPos: [win32def.DTypes.BOOL, [win32def.DTypes.LPPOINT]],
}, user32);


module.exports = user32;
