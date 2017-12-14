const formioUtils = require('formiojs/utils');
const _set = require('lodash/set');

module.exports = (components, data) => {
  return new Promise((resolve, reject) => {
    try {
      const componentMap = {};
      const datagrids = {};
      formioUtils.eachComponent(components, (component, path) => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.properties.xpath] = componentMap[component.properties.xpath] || [];
          componentMap[component.properties.xpath].push(path);
        }
        if (component.type === 'datagrid') {
          datagrids[component.key] = component;
        }
      });

      let newData = {};
      for (let instanceId in data) {
        const key = instanceId.replace(/#\d+/g, '[#n]');
        const indexes = instanceId.match(/#\d+/g);
        let paths = componentMap.hasOwnProperty(key) ? componentMap[key] : key;

        paths.forEach(path => {
          // Support datagrid nesting.
          path = path.split('.').reduce((prev, part) => {
            if (datagrids.hasOwnProperty(part) && indexes && indexes.length) {
              let index = indexes.shift();
              index = parseInt(index.replace('#', '') - 1);
              part = part + '[' + index + ']'
            }
            return prev ? prev + '.' + part : part;
          }, '');

          // Support multi-value fields.
          if (indexes && indexes.length) {
            let index = indexes.shift();
            index = parseInt(index.replace('#', '') - 1);
            path = path + '[' + index + ']'
          }

          _set(newData, path, data[instanceId]);
        });
      }
      resolve({data: newData});
    }
    catch (e) {
      reject(e);
    }
  });
};
