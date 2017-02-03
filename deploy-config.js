const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

const opts = {
  publicPath: (env) => {
    if (env === 'production' || env === 'staging') {
      return '/embed/the-flow-towards-europe-updating/';
    }
    return null;
  },
};

module.exports = lucifyDeployConfig(null, opts);
