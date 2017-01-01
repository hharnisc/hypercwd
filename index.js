const {exec} = require('child_process');

let curPid;
let uids = {};
// for windows support
let curDir;
const dirRegex = /([\w]:[\s\S]+)>/;

const setCwd = (pid) => {
  if (process.platform === 'win32') {
    if (curDir) {
      store.dispatch({
        type: 'SESSION_SET_CWD',
        cwd: curDir
      });
    }
  } else {
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
  }
}

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_ADD_DATA':
      if (process.platform === 'win32' && dirRegex.test(action.data)) curDir = dirRegex.exec(action.data)[1];
      break;
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
