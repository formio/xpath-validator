const request = require('request');
const config = require('../config');

module.exports = (url, data) => {
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
      json: data
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      else {
        if (typeof body === 'boolean') {
          body = {
            name: 'ValidationSuccess',
            details: []
          };
        }
        if (body._validated) {
          body._object = body._validated;
        }
        return resolve(body, response);
      }
    });
  });
};
