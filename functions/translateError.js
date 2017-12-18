module.exports = (error, components, data) => {
  return new Promise((resolve, reject) => {
    // Pass original data.
    error.details = error.details.map(detail => {
      const indices = detail.indices;
      delete detail.indices;

      // Inconsistent are already translated.
      if (detail.type === 'INCONSISTENT|WARNING') {
        return detail;
      }

      let instanceId = detail.key;
      indices.forEach(index => {
        instanceId = instanceId.replace('[#n]', index);
      });

      const lastPart = detail.path[detail.path.length - 1];

      return {
        key: detail.key + (detail.label ? '|' + detail.label : ''),
        label: detail.label,
        // path: detail.original,
        instanceId: instanceId,
        value: data[instanceId] || '',
        type: detail.type === 'any.required' ? 'MISSING|ERROR' : 'INVALID|ERROR',
        severityLevel: 'ERROR',
        reason: detail.message.replace(lastPart, instanceId)
      };
    });
    resolve({
      status: error.name,
      errors: error.details,
      _object: error._object
    });
  });
};