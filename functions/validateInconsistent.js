const isEqual = require('lodash/isEqual');
const keys = require('lodash/keys');
const difference = require('lodash/difference');

module.exports = (result, components, data) => {
  return new Promise((resolve, reject) => {
    try {
      if (isEqual(result._object, data)) {
        return resolve(result);
      }

      result.name = 'ValidationError';

      // Look for any keys that weren't returned. These are inconsistent.
      difference(keys(data), keys(result._object)).forEach(function(key) {
        result.details.push({
          key: key,
          instanceId: key,
          value: data[key],
          type: 'INCONSISTENT',
          reason: 'Value is not consistent with other answers'
        });
      });

      return resolve(result);
    }
    catch (e) {
      return reject(e);
    }
  });
};
