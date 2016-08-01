const { exec } = require('child_process');

let curPid;
let uids = {};

const setCwd = (pid) =>
  exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
    if (err) {
      console.error(err);
    } else {
      cwd = cwd.trim();
      store.dispatch({
        type: 'SESSION_SET_CWD',
        cwd
      });
    }
  });

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_PTY_DATA':
      if (curPid && uids[action.uid] === curPid) setCwd(curPid);
      break;
    case 'SESSION_ADD':
      uids[action.uid] = action.pid;
      curPid = action.pid;
      setCwd(curPid);
      break;
    case 'SESSION_SET_ACTIVE':
      curPid = uids[action.uid];
      setCwd(curPid);
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
