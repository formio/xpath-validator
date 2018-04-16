module.exports = (error, components, data) => {
  return new Promise((resolve, reject) => {
    // Pass original data.
    error.details = error.details.reduce((result, detail) => {
      const indices = detail.indices;
      delete detail.indices;

      // Inconsistent are already translated.
      if (detail.after) {
        delete detail.after;
        result.push(detail);
        return result;
      }

      let instanceId = detail.key;
      if (typeof instanceId !== 'string') {
        return result;
      }
      indices.forEach(index => {
        instanceId = instanceId.replace('[#n]', index);
      });

      const lastPart = detail.path[detail.path.length - 1];

      result.push({
        key: detail.key + (detail.label ? '|' + detail.label : ''),
        label: detail.label,
        // path: detail.original,
        instanceId: instanceId,
        value: data[instanceId] || '',
        type: detail.type === 'any.required' ? 'MISSING|ERROR' : 'INVALID|ERROR',
        severityLevel: 'ERROR',
        reason: detail.message.replace(lastPart, instanceId)
      });
      return result;
    }, []);
    resolve({
      status: error.name,
      errors: error.details,
      _object: error._object
    });
  });
};