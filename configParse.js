module.exports = config => {
  if (!config) {
    return {};
  } else if (!config.hypercwd) {
    console.log('hypercwd: no \'config.hypercwd\' object found in ~/.hyper.js - see https://github.com/hharnisc/hypercwd#configuration for configuration details');
    return {};
  } else if (!(config.hypercwd === Object(config.hypercwd))) {
    console.log('hypercwd: \'config.hypercwd\' is not an object in ~/.hyper.js - see https://github.com/hharnisc/hypercwd#configuration for configuration details');
    return {};
  }
  return config.hypercwd;
};
