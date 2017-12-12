const isEqual = require('lodash/isEqual');
const keys = require('lodash/keys');
const difference = require('lodash/difference');
const formioUtils = require('formiojs/utils');

module.exports = (result, components, data) => {
  const componentMap = {};
  formioUtils.eachComponent(components, component => {
    if (component.properties && component.properties.xpath) {
      componentMap[component.properties.xpath] = component;
    }
  });

  return new Promise((resolve, reject) => {
    try {
      if (isEqual(result._object, data)) {
        return resolve(result);
      }

      result.name = 'ValidationError';

      // Look for any keys that weren't returned. These are inconsistent.
      difference(keys(data), keys(result._object)).forEach(function(key) {
        const component = componentMap.hasOwnProperty(key) ? componentMap[key] : {};
        const label = component.label || component.title || '';

        result.details.push({
          key: key + (label ? '|' + label : ''),
          label: label,
          instanceId: key,
          value: data[key],
          type: 'INCONSISTENT|WARNING',
          severityLevel: 'WARNING',
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
