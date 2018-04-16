const isEqual = require('lodash/isEqual');
const keys = require('lodash/keys');
const difference = require('lodash/difference');
const formioUtils = require('formiojs/utils');
const _ = require('lodash');

module.exports = (result, components, data) => {
  const componentMap = {};
  formioUtils.eachComponent(components, (component, path) => {
    if (component.properties && component.properties.xpath) {
      component.path = path;
      componentMap[component.properties.xpath] = componentMap[component.properties.xpath] || [];
      componentMap[component.properties.xpath].push(component);
    }
  }, false, '', true);

  const checkFormVisibility = component => {
    // If we don't have a parent, it is visible.
    if (!component.parent) {
      return component;
    }
    const parent = component.parent;
    if (parent.type === 'form') {
      const parentPath = parent.path.split('.').slice(0, -1).join('.');
      let data = result._validated;
      if (parentPath) {
        data = _.get(data, parentPath);
      }
      if (!FormioUtils.checkCondition(parent, data, data)) {
        // If form is not visible, return false so we move on to the next component.
        return false;
      }
    }
    if(checkFormVisibility(parent)) {
      // Recurse to parent component;
      return component;
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const originalData = data;
      const resultData = result._object;

      if (isEqual(resultData, originalData)) {
        return resolve(result);
      }

      // Get an array of all unique key names.
      const allKeys = _([]).concat(keys(originalData), keys(resultData)).uniq();

      // Find any differences and mark with the appropriate error message.
      allKeys.forEach(key => {
        let label = '';
        let type = '';
        let severityLevel = '';
        let reason = '';
        const hasOriginal = originalData.hasOwnProperty(key) && originalData[key] !== '';
        const hasResult = resultData.hasOwnProperty(key) && resultData[key] !== '';

        if (hasOriginal && hasResult) {
          // If exists in both places, ensure they are equal.
          if (!_.isEqual(originalData[key], resultData[key])) {
            // If they aren't equal then the server calculated something different.
            type = 'INCONSISTENT|WARNING';
            severityLevel = 'WARNING';
            reason = 'Value is not consistent with other answers';
          }
          // If they are equal then we are done.
        }
        else if (hasOriginal && !hasResult) {
          // Was in the original data but wasn't returned. This is inconsistent data.
          type = 'INCONSISTENT|WARNING';
          severityLevel = 'WARNING';
          reason = 'Value is not consistent with other answers';
        }
        else if (!hasOriginal && hasResult) {
          // Data wasn't passed in but was calculated on server.
          type = 'INVALID|ERROR';
          severityLevel = 'ERROR';
          reason = 'Missing calculated value';
        }
        // !hasOriginal and !hasResult is find since both are empty strings.

        if (type) {
          // Ensure the entire result is marked as an error.
          result.name = 'ValidationError';

          if (componentMap.hasOwnProperty(key)) {
            let component;

            // If there is only one component, choose it.
            if (componentMap[key].length === 1) {
              component = componentMap[key][0];
            }
            else {
              // If the xpath maps to multiple components, choose the first one in a visible form.
              component = componentMap[key].reduce((result, component) => result || checkFormVisibility(component), false);
            }
            // If we didn't find one in a visible form, choose the first.
            if (!component) {
              component = componentMap[key][0];
            }

            label = component.label || component.title || '';
          }

          result.details.push({
            key: key + (label ? '|' + label : ''),
            label: label,
            instanceId: key,
            value: data[key],
            type,
            severityLevel,
            reason,
            after: true
          });
        }
      });

      return resolve(result);
    }
    catch (e) {
      return reject(e);
    }
  });
};
