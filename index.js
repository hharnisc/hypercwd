const { exec } = require('child_process');

let curPid;
let curCwd;
let uids = {};

// For Windows Support:
// the final excluded character () is an odd character
// that was added to the end of the line by posh-hg/posh-git
const directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;

const getNewCwdWindows = (action, cb) => {
  const newCwd = directoryRegex.exec(action.data);
  cb(undefined, newCwd ? newCwd[0] : undefined);
};

const getNewCwd = (pid, cb) =>
  exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, newCwd) => {
    if (err) {
      cb(err);
    } else {
      cb(undefined, newCwd.trim());
    }
  });

const dispatchNewCwd = (store, newCwd) => {
  if (curCwd !== newCwd) {
    store.dispatch({
      type: 'SESSION_SET_CWD',
      newCwd,
    });
    curCwd = newCwd;
  }
};

const setCwd = (store, action, pid) => {
  const handleNewCwd = (err, newCwd) => {
    if (err) {
      console.error(err);
    } else {
      dispatchNewCwd(store, newCwd);
    }
  }
  if (process.platform === 'win32') {
    getNewCwdWindows(action, handleNewCwd);
  } else if (curPid && uids[action.uid] === curPid) {
    getNewCwd(pid, handleNewCwd);
  }
};

// const setCwd = (store, pid) =>
//   exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, newCwd) => {
//     if (err) {
//       console.error(err);
//     } else {
//       const cwd = newCwd.trim();
//       // keep track of curCwd internally
//       // protects against state tree changes
//       if (curCwd !== cwd) {
//         store.dispatch({
//           type: 'SESSION_SET_CWD',
//           cwd,
//         });
//         curCwd = cwd;
//       }
//     }
//   });

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_PTY_DATA':
      // if (curPid && uids[action.uid] === curPid) setCwd(store, curPid);
      setCwd(store, action, curPid);
      break;
    case 'SESSION_ADD':
      uids[action.uid] = action.pid;
      curPid = action.pid;
      // setCwd(store, curPid);
      setCwd(store, action, curPid);
      break;
    case 'SESSION_SET_ACTIVE':
      curPid = uids[action.uid];
      // setCwd(store, curPid);
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
