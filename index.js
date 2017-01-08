const { exec } = require('child_process');

let curPid;
let curCwd;
let uids = {};

const setCwd = (store, pid) =>
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
  });

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_PTY_DATA':
      if (curPid && uids[action.uid] === curPid) setCwd(store, curPid);
      break;
    case 'SESSION_ADD':
      uids[action.uid] = action.pid;
      curPid = action.pid;
      setCwd(store, curPid);
      break;
    case 'SESSION_SET_ACTIVE':
      curPid = uids[action.uid];
      setCwd(store, curPid);
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
