var debug = require('debug')('node-songkick:songkick-api-v3.0');
var request = require('request');
var querystring = require('querystring');

function defaults(obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function SongkickApiV3(apiKey, options) {
  options = options || {};
  
  this.apiKey = apiKey;
  this.version = '3.0';
  this.uri = 'http://api.songkick.com/api/' + this.version;
  this.packageInfo = options.packageInfo;

  // api sections
  this.users = new Users(this);
}

SongkickApiV3.prototype.execute = function(apiMethod, httpMethod, qsParams, payload, callback) {
  if (typeof payload === 'function') {
    callback = payload;
    payload = null;
  }

  var uri = this.uri + apiMethod;
  var qs = defaults({ apikey: this.apiKey }, qsParams);

  debug('Songkick API Request (apikey is hidden): ' + uri + '?' + querystring.stringify(qsParams));

  var requestOptions = {
    method: httpMethod,
    uri: this.uri + apiMethod,
    qs: qs,
    headers: { 'User-Agent' : this.userAgent + 'node-songkick-v' + packageInfo }
  };

  if (payload !== null && typeof payload !== 'undefined') {
    requesstOptions.body = JSON.stringify(payload);
  }

  request(requestOptions, function (err, response, body) {
    var parsedResponse = null;

    if (err) {
      callback(new Error('Unable to connect to the Songkick API endpoint'));
    } else {
      try {
        parsedResponse = JSON.parse(body);
      } catch (err) {
        return callback(new Error('Error parsing JSON response from Songkick API'));
      }

      if (response.statusCode !== 200 || parsedResponse.status === 'error') {
        return callback(new Error('The status code is either error or not 200'));
      }

      callback(null, parsedResponse);
    }
  });
};

/**
 * User’s events and trackings.
 *
 * @link https://www.songkick.com/developer/user
 */
function Users(requestExecutor) {
  this.requestExecutor = requestExecutor;
}

/**
 * Returns a list of calendar entries with events for a user’s tracked artists 
 * in her tracked metro areas.
 *
 * @param {string} username The username for whom the calendar needs to be retrieved
 * @param {object} options API call options. Support for reason('tracked_artist', 'attendance').
 */
Users.prototype.calendar = function (username, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = defaults(options, { reason: 'attendance' });

  this.requestExecutor.execute('/users/' + username + '/calendar.json', 'GET', options, callback);
};

/**
 * Returns events that the user is planning to attend. This method returns a 
 * list of events, instead of calendar entries.
 *
 * @param {string} attendance Any of 'all', 'im_going', 'i_might_go'. If not 
 *    explicitly passed in, attendance will default to "im_going", returning 
 *    events the user is definitely going to.
 */
Users.prototype.events = function (username, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = defaults(options, { attendance: 'im_going' });
  
  this.requestExecutor.execute('/users/' + username + '/events.json', 'GET', options, callback);
};

module.exports = SongkickApiV3;

