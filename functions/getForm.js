const request = require('request');
const config = require('../config');

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: config.formioServer + url + '?full=true',
      headers: {
        'x-token': config.apiKey
      }
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      else if (response.statusCode !== 200) {
        return reject(body);
      }
      else {
        try {
          return resolve(JSON.parse(body), response);
        }
        catch (error) {
          return reject(body);
        }
      }
    });
  });
};
