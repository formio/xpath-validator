const request = require('request');
const config = require('../config');

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: config.formioServer + url,
      headers: {
        'x-token': config.apiKey
      }
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      else {
        return resolve(JSON.parse(body), response);
      }
    });
  });
};
