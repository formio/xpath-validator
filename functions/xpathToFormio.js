const formioUtils = require('formiojs/utils');
const _set = require('lodash/set');
const _isNaN = require('lodash/isNaN');

module.exports = (components, data) => {
  return new Promise((resolve, reject) => {
    try {
      let componentMap = {};
      formioUtils.eachComponent(components, component => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.properties.xpath] = component.key;
        }
      });

      let newData = {};
      for(let key in data) {
        let path = key.split(/#(\d)/);

        // Replace path.
        path = path.map(part => {
          if (!isNaN(part)) {
            return parseInt(part) - 1;
          }
          return componentMap.hasOwnProperty(part) ? componentMap[part] : part;
        });

        _set(newData, path, data[key]);
      }
      resolve({data: newData});
    }
    catch (e) {
      reject(e);
    }
  });
};
