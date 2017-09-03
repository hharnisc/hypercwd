const { readFileSync } = require('fs');
const { homedir } = require('os');
const { resolve, join, sep } = require('path');


module.exports = () => {
  let config = {};
  try {
    config = JSON.parse(readFileSync(join(homedir(), '.hypercwdrc.json'), 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('hypercwd: no config file found at ~/.hypercwdrc.json');
    } else if (e.message.indexOf('JSON') > -1) {
      console.error(`hypercwd: there was an error parsing JSON in ~/.hypercwdrc.json file: ${e.message}`);
    } else {
      console.error('hypercwd: unexpected error:\n', e);
    }
  }
  return config;
};
