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
      if (isEqual(result._object, data)) {
        return resolve(result);
      }

      result.name = 'ValidationError';

      // Look for any keys that weren't returned. These are inconsistent.
      difference(keys(data), keys(result._object)).forEach(function(key) {
        let label = '';
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
