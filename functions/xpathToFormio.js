const formioUtils = require('formiojs/utils');
const _set = require('lodash/set');
const _isNaN = require('lodash/isNaN');

module.exports = (components, data) => {
  return new Promise((resolve, reject) => {
    try {
      let componentMap = {};
      formioUtils.eachComponent(components, (component, path) => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.properties.xpath] = path;
        }
      });

      let newData = {};
      for(let key in data) {
        let path = key.split(/#(\d)/).filter(item => item);

        // Replace path.
        path = path.map(part => {
          if (!isNaN(part)) {
            return parseInt(part) - 1;
          }
          return componentMap.hasOwnProperty(part) ? componentMap[part] : part;
        });

        let newPath = [];
        path.forEach(part => {
          if (typeof (part) === 'string') {
            let parts = part.split('.');
            parts.forEach(subpart => {
              if (!newPath.includes(subpart)) {
                newPath.push(subpart);
              }
            });
          }
          else {
            newPath.push(part);
          }
        });

        _set(newData, newPath, data[key]);
      }
      resolve({data: newData});
    }
    catch (e) {
      reject(e);
    }
  });
};
