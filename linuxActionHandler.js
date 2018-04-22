const { existsSync } = require('fs');
const configParse = require('./configParse');
const { setCwd } = require('./setCwd');
const fixPath = require('./fixPath');

let tabs = {};

module.exports = ({ getState, dispatch }) => next => async (action) => {
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
    case 'SESSION_REQUEST':
    case 'TERM_GROUP_REQUEST':
      const { sessions: { activeUid } } = getState();
      if (activeUid) {
        await setCwd({ dispatch, action, tab: tabs[activeUid]});
      }
      break;
    case 'SESSION_ADD':
      tabs[action.uid] = {
        pid: action.pid,
      };
      break;
    case 'SESSION_PTY_EXIT':
      delete tabs[action.uid];
      break;
    case 'SESSION_USER_EXIT':
      delete tabs[action.uid];
      break;
    default:
      break;
  }
  next(action);
}
