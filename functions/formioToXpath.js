const formioUtils = require('formiojs/utils');

const replaceKeys = (componentMap, data) => {
  if (Array.isArray(data)) {
    return data.map((item) => replaceKeys(componentMap, item));
  }
  else if (typeof data === 'object') {
    let newData = {};
    for(let key in data) {
      if (componentMap[key]) {
        newData[componentMap[key]] = replaceKeys(componentMap, data[key]);
      }
      else {
        newData[key] = replaceKeys(componentMap, data[key]);
      }
    }
    return newData;
  }
  else {
    return data;
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
      result.data = replaceKeys(componentMap, result.data);

      result.details.forEach(detail => {
        detail.path = componentMap[detail.path] || detail.path
      });

      resolve(result);
    }
    catch (e) {
      reject(e);
    }
  });
};
