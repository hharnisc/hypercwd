const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const setCwd = async ({ dispatch, action, tab }) => {
  const newCwd = await promiseExec(
    `LANG=en_US.UTF-8 lsof -p ${tab.pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`);
  const cwd = newCwd.trim();
  dispatch({
    type: 'SESSION_SET_CWD',
    cwd,
  });
};

// For Windows Support:
// the final excluded character () is an odd character
// that was added to the end of the line by posh-hg/posh-git
const directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;

const windowsSetCwd = ({ dispatch, action, tab, curTabId }) => {
  const newCwd = directoryRegex.exec(action.data);
  if (newCwd) {
    const cwd = newCwd[0];
    if (tab.cwd !== cwd && action.uid === curTabId) {
      dispatch({
        type: 'SESSION_SET_CWD',
        cwd,
      });
    }
    tab.cwd = cwd;
  }
};

module.exports = {
  setCwd,
  windowsSetCwd,
}
