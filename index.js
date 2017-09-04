const { exec } = require('child_process');
const { existsSync } = require('fs');
const configParse = require('./configParse');
const fixPath = require('./fixPath');

let curCwd;
let tabs = {};
let curTabId;

// For Windows Support:
// the final excluded character () is an odd character
// that was added to the end of the line by posh-hg/posh-git
const directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;

const setCwd = (store, action, tabId, forceDispatch) => {
  const tab = tabs[tabId];
  if (process.platform === 'win32') {
    const newCwd = directoryRegex.exec(action.data);
    if (newCwd) {
      const cwd = newCwd[0];
      if (tab.cwd !== cwd && tabId === curTabId) {
        store.dispatch({
          type: 'SESSION_SET_CWD',
          cwd,
        });
      }
      tab.cwd = cwd;
    }
  } else {
    exec(`lsof -p ${tab.pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, newCwd) => {
      if (err) {
        console.error(err);
      } else {
        const cwd = newCwd.trim();
        if (tab.cwd !== cwd && tabId === curTabId) {
          store.dispatch({
            type: 'SESSION_SET_CWD',
            cwd,
          });
        }
        tab.cwd = cwd;
      }
    })
  }
};

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'CONFIG_LOAD': {
      const hypercwdConfig = configParse(action.config);
      if (hypercwdConfig.initialWorkingDirectory) {
        const initialWorkingDirectory = fixPath(hypercwdConfig.initialWorkingDirectory);
        if (initialWorkingDirectory && existsSync(initialWorkingDirectory)) {
          store.dispatch({
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
      setCwd(store, action, action.uid);
      break;
    case 'SESSION_ADD':
      tabs[action.uid] = {
        pid: action.pid,
      };
      curTabId = action.uid;
      setCwd(store, action, action.uid);
      break;
    case 'SESSION_SET_ACTIVE':
      curTabId = action.uid;
      store.dispatch({
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
