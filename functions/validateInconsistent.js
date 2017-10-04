const isEqual = require('lodash/isEqual');
const keys = require('lodash/keys');
const difference = require('lodash/difference');

module.exports = (result) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(keys(result.data));
      console.log(keys(result._object));
      console.log(difference(keys(result._object), keys(result.data)));
      if (isEqual(result._object, result.data)) {
        return resolve(result);
      }

      result.name = 'ValidationError';

      // Look for any keys that weren't returned. These are inconsistent.
      difference(keys(result.data), keys(result._object)).forEach(function(key) {
        result.details.push({
          key: key,
          instanceId: key,
          value: result.data[key],
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
