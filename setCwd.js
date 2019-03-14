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
