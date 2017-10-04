module.exports = (error, components, data) => {
  return new Promise((resolve, reject) => {
    // Pass original data.
    error.details = error.details.map(detail => {
      // Inconsistent are already translated.
      if (detail.type === 'INCONSISTENT') {
        return detail;
      }

      let key = detail.path.map(part => {
        if (!isNaN(part)) {
          return '#' + part;
        }
        return part;
      }).join('');

      return {
        key: detail.path.map(part => {
          if (!isNaN(part)) {
            return '[#n]';
          }
          return part;
        }).join(''),
        instanceId: key,
        value: data[key] || '',
        type: detail.type === 'any.required' ? 'MISSING' : 'INVALID',
        reason: detail.message
      };
    });
    resolve({
      status: error.name,
      errors: error.details,
      _object: error._object
    });
  });
};