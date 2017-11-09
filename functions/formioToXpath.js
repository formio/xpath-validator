const formioUtils = require('formiojs/utils');

const replaceKeys = (newData, path, componentMap, data) => {
  if (Array.isArray(data)) {
    data.map((item, index) => replaceKeys(newData, path + '#' + (index + 1), componentMap, item));
  }
  else if (typeof data === 'object') {
    for(let key in data) {
      if (componentMap[key]) {
        replaceKeys(newData, path + componentMap[key], componentMap, data[key]);
      }
      else {
        replaceKeys(newData, path, componentMap, data[key]);
      }
    }
  }
  else {
    if (path) {
      newData[path] = data;
    }
  }
};

module.exports = (result, components) => {
  return new Promise((resolve, reject) => {
    try {
      let componentMap = {};
      formioUtils.eachComponent(components, component => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.key] = component.properties.xpath;
        }
      });

      let newData = {};

      replaceKeys(newData, '', componentMap, result._object);

      result._object = newData;

      result.details.forEach(detail => {
        detail.path = detail.path.map(part => {
          if (!isNaN(part)) {
            return (part + 1).toString();
          }
          return componentMap.hasOwnProperty(part) ? componentMap[part] : part;
        });
      });

      resolve(result);
    }
    catch (e) {
      reject(e);
    }
  });
};
