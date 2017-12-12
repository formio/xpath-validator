const formioUtils = require('formiojs/utils');
const _set = require('lodash/set');

const replaceKeys = (newData, path, componentMap, data, indices) => {
  if (Array.isArray(data)) {
    data.map((item, index) => replaceKeys(newData, path, componentMap, item, indices.concat([index])));
  }
  else if (typeof data === 'object') {
    for(let key in data) {
      if (componentMap[key]) {
        replaceKeys(newData, componentMap[key].properties.xpath, componentMap, data[key], indices);
      }
      else {
        replaceKeys(newData, path, componentMap, data[key], indices);
      }
    }
  }
  else {
    if (path) {
      indices.forEach(index => {
        path = path.replace('[#n]', '#' + (index + 1));
      });
      newData[path] = data;
    }
  }
};

module.exports = (result, components) => {
  return new Promise((resolve, reject) => {
    try {
      const componentMap = {};
      formioUtils.eachComponent(components, component => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.key] = component;
        }
      });

      let newData = {};

      replaceKeys(newData, '', componentMap, result._object, []);

      result._object = newData;

      result.details.forEach(detail => {
        if (!Array.isArray(detail.path)) {
          detail.path = [detail.path];
        }

        const lastPart = detail.path[detail.path.length - 1];
        detail.key = componentMap.hasOwnProperty(lastPart) ? componentMap[lastPart].properties.xpath : lastPart;
        detail.label = componentMap.hasOwnProperty(lastPart) ? componentMap[lastPart].label || componentMap[lastPart].title || '' : lastPart;
        detail.indices = detail.path
          .map(part => {
            if (!isNaN(part)) {
              return '#' + (part + 1).toString();
            }
          })
          .filter(item => item);
      });

      resolve(result);
    }
    catch (e) {
      reject(e);
    }
  });
};
