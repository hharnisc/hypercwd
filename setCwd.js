const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const setCwd = ({dispatch, action, tab}) => {
  return promiseExec(
    `LANG=en_US.utf-8 lsof -n -p ${
      tab.pid
    } | grep cwd | tr -s ' ' | cut -d ' ' -f9-`
  ).then((newCwd) => {
    const cwd = (newCwd.stdout || newCwd).trim();
    dispatch({type: "SESSION_SET_CWD", cwd});
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
