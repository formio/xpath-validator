const isEqual = require('lodash/isEqual');
const keys = require('lodash/keys');
const difference = require('lodash/difference');

module.exports = (result) => {
  return new Promise((resolve, reject) => {
    try {
      if (isEqual(result.data, result._object)) {
        return resolve(result);
      }

      result.name = 'ValidationError';

      // Look for any keys that weren't returned. These are inconsistent.
      difference(keys(result._object), keys(result.data)).forEach(function(key) {
        console.log(key);
        result.details.push({
          key: key,
          instanceId: key,
          value: result._object[key],
          type: 'INCONSISTENT',
          message: 'Value is not consistent with other answers'
        });
      });

      return resolve(result);
    }
    catch (e) {
      return reject(e);
    }
  });
};
