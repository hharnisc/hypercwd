const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const setCwd = async ({ dispatch, action, tab }) => {
  const newCwd = await promiseExec(
    `lsof -a -p ${tab.pid} -d cwd -Fn | tail -1 | sed 's/.//'`);
  // Since Node v8, return type of a promisified exec has changed: 
  // https://github.com/nodejs/node/commit/fe5ca3ff27 
  const cwd = typeof newCwd === 'string' ? newCwd.trim() : newCwd.stdout.trim();
  dispatch({
    type: 'SESSION_SET_CWD',
    cwd,
  });
};

// For Windows Support:
// the final excluded () and () characters
// that was added by posh-hg/posh-git and bash
const reMsShell = /([A-Z]:(([^\s][^\:\[\]\?\"\<\>\|]+)|\\))/mi;
const reLinuxShell = /\:\s\/mnt\/([A-Z])([^\:\[\]\?\"\<\>\|]+)?/mi;

const parseWindowsCwd = (data) => {
  const linuxCwd = reLinuxShell.exec(data);
  if (linuxCwd) return [linuxCwd[1].toUpperCase(), linuxCwd[2] || '/'].join(':');

  const msCwd = reMsShell.exec(data);
  if (msCwd) return msCwd[0];
}

const windowsSetCwd = ({ dispatch, action, tab, curTabId }) => {
  const newCwd = parseWindowsCwd(action.data);
  if (newCwd) {
    if (tab.cwd !== newCwd && action.uid === curTabId) {
      dispatch({
        type: 'SESSION_SET_CWD',
        cwd: newCwd
      });
    }
    tab.cwd = newCwd;
  }
};

module.exports = {
  setCwd,
  windowsSetCwd,
}
