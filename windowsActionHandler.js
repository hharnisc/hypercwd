const { existsSync } = require('fs');
const configParse = require('./configParse');
const { windowsSetCwd } = require('./setCwd');
const fixPath = require('./fixPath');

let tabs = {};
let curTabId;

module.exports = ({ dispatch }) => next => (action) => {
  switch (action.type) {
    case 'CONFIG_LOAD': {
      const hypercwdConfig = configParse(action.config);
      if (hypercwdConfig.initialWorkingDirectory) {
        const initialWorkingDirectory = fixPath(hypercwdConfig.initialWorkingDirectory);
        if (initialWorkingDirectory && existsSync(initialWorkingDirectory)) {
          dispatch({
            type: 'SESSION_SET_CWD',
            cwd: initialWorkingDirectory,
          });
        } else {
          console.error(`hypercwd: could not find initialWorkingDirectory path: ${hypercwdConfig.initialWorkingDirectory} - see https://github.com/hharnisc/hypercwd#configuration for configuration details`);
        }
      }
      break;
    }
    case 'SESSION_PTY_DATA':
      windowsSetCwd({ dispatch, action, tab: tabs[action.uid], curTabId });
      break;
    case 'SESSION_ADD':
      tabs[action.uid] = {
        pid: action.pid,
      };
      curTabId = action.uid;
      windowsSetCwd({ dispatch, action, tab: tabs[action.uid], curTabId });
      break;
    case 'SESSION_SET_ACTIVE':
      curTabId = action.uid;
      dispatch({
        type: 'SESSION_SET_CWD',
        cwd: tabs[curTabId].cwd,
      });
      break;
    case 'SESSION_PTY_EXIT':
      delete tabs[action.uid];
      break;
    case 'SESSION_USER_EXIT':
      delete tabs[action.uid];
      break;
  }
  next(action);
};
