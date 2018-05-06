const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const setCwd = async ({ dispatch, action, tab }) => {
  const newCwd = await promiseExec(
    `lsof -p ${tab.pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`);
  const cwd = newCwd.trim();
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
