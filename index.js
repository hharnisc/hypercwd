const { exec } = require('child_process');

let curPid;
let curCwd;
let uids = {};

// For Windows Support:
// the final excluded character () is an odd character
// that was added to the end of the line by posh-hg/posh-git
const directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;

const setCwd = (store, action, pid) => {
  if (process.platform === 'win32') {
    const newCwd = directoryRegex.exec(action.data);
    if (newCwd) {
      const cwd = newCwd[0];
      if (curCwd !== cwd) {
        store.dispatch({
          type: 'SESSION_SET_CWD',
          cwd,
        });
        curCwd = cwd;
      }
    }
  } else if (curPid && uids[action.uid] === curPid) {
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, newCwd) => {
      if (err) {
        console.error(err);
      } else {
        const cwd = newCwd.trim();
        // keep track of curCwd internally
        // protects against state tree changes
        if (curCwd !== cwd) {
          store.dispatch({
            type: 'SESSION_SET_CWD',
            cwd,
          });
          curCwd = cwd;
        }
      }
    })
  }
};

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_PTY_DATA':
      setCwd(store, action, curPid);
      break;
    case 'SESSION_ADD':
      uids[action.uid] = action.pid;
      curPid = action.pid;
      setCwd(store, action, curPid);
      break;
    case 'SESSION_SET_ACTIVE':
      curPid = uids[action.uid];
      setCwd(store, action, curPid);
      break;
    case 'SESSION_PTY_EXIT':
      delete uids[action.uid];
      break;
    case 'SESSION_USER_EXIT':
      delete uids[action.uid];
      break;
  }
  next(action);
};
