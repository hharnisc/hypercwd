const { sep, join } = require('path');
const { homedir } = require('os');

module.exports = pathToWorkingDirectory => {
  if (!pathToWorkingDirectory) {
    return;
  }
  const pathParts = pathToWorkingDirectory.split(sep);

  if (pathParts[0] === '~') {
    pathParts[0] = homedir();
  }
  return join(...pathParts);
};
