var package = require('../package');
var SongkickApiV3 = require('./songkick-api-v3_0');

function Songkick(apiKey, options) {
  if (!apiKey) {
    throw new Error('You have to provide an API Key for this to work.');
  }
  options = options || {};
  options.packageInfo = package.version;

  return new SongkickApiV3(apiKey, options);
}

module.exports = Songkick;
