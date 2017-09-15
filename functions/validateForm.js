const request = require('request');
const config = require('../config');

module.exports = (url, body) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      uri: config.formioServer + url + '/submission',
      qs: {
        dryrun: true
      },
      headers: {
        'x-token': config.apiKey
      },
      json: body
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      else {
        return resolve(body, response);
      }
    });
  });
};
