module.exports = (error, components, data) => {
  return new Promise((resolve, reject) => {
    // Pass original data.
    error.details = error.details.map(detail => {
      // Inconsistent are already translated.
      if (detail.type === 'INCONSISTENT') {
        return detail;
      }

      return {
        key: detail.path,
        instanceId: detail.path,
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