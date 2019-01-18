const { existsSync } = require('fs');
const configParse = require('./configParse');
const { setCwd } = require('./setCwd');
const fixPath = require('./fixPath');

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
      const { sessions, sessions: { activeUid } } = getState();
      const pid = sessions.sessions[activeUid].pid
      if (pid) {
        await setCwd({ dispatch, action, tab: {pid: pid}});
      }
      break;
    default:
      break;
  }
  next(action);
}
