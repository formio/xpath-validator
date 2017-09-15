const formioUtils = require('formiojs/utils');

module.exports = (error, components, data) => {
  let componentMap = {};
  formioUtils.eachComponent(components, component => {
    if (component.properties && component.properties.xpath) {
      componentMap[component.key] = component.properties.xpath;
    }
  });
  return new Promise((resolve, reject) => {
    // Pass original data.
    error._object = data;
    error.details.map(detail => {
      if (componentMap[detail.path]) {
        detail.context.key = componentMap[detail.path];
        detail.path = componentMap[detail.path];
      }
      return detail;
    });
    resolve(error);
  });
};