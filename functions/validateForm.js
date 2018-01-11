const formioUtils = require('formiojs/utils');
const _ = require('lodash');
const request = require('request');
const config = require('../config');

module.exports = (url, data, components) => {
  const submitData = _.clone(data);
  // Change the way that datagrid validation works by making sure any required rows are added. This wil make fields on
  // those rows return errors instead of the datagrid itself.
  formioUtils.eachComponent(components, (component, path) => {
    if (component.type === 'datagrid' && component.validate && component.validate.minLength > 0) {
      let value = _.get(submitData, 'data.' + path, []);
      if (!Array.isArray(value)) {
        value = [];
      }
      if (value.length < component.validate.minLength) {
        for (let i = value.length; i < component.validate.minLength; i++) {
          value.push({});
        }
      }
      _.set(submitData, 'data.' + path, value);
    }
  });

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
      json: submitData
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      else {
        if (!body.isJoi) {
          body = {
            name: 'ValidationSuccess',
            details: [],
            _object: body.data
          };
        }
        else {
          body._object = body._validated;
        }
        return resolve(body, response);
      }
    });
  });
};
