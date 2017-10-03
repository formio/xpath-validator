module.exports = (error, components, data) => {
  return new Promise((resolve, reject) => {
    // Pass original data.
    error.details = error.details.map(detail => {
      // Inconsistent are already translated.
      if (detail.type === 'INCONSISTENT') {
        return detail;
      }

      return {
        key: detail.path.map(part => {
          if (!isNaN(part)) {
            return '[#n]';
          }
          return part;
        }).join(''),
        instanceId: detail.path.map(part => {
          if (!isNaN(part)) {
            return '#' + part;
          }
          return part;
        }).join(''),
        value: data[detail.path] || '',
        type: detail.type === 'any.required' ? 'MISSING' : 'INVALID',
        message: detail.message
      };
    });
    resolve({
      status: error.name,
      errors: error.details,
      _object: error._object
    });
  });
};