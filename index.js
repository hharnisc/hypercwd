const linuxActionHandler = require('./linuxActionHandler');
const windowsActionHandler = require('./windowsActionHandler');

if (process.platform === 'win32') {
  exports.middleware = windowsActionHandler;
} else {
  exports.middleware = linuxActionHandler;
}
