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

module.exports = (data, components) => {
  return new Promise((resolve, reject) => {
    try {
      let componentMap = {};
      formioUtils.eachComponent(components, component => {
        if (component.properties && component.properties.xpath) {
          componentMap[component.properties.xpath] = component.key;
        }
      });
      resolve(replaceKeys(componentMap, data));
    }
    catch (e) {
      reject(e);
    }
  });
};
