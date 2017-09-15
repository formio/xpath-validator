module.exports = {
  formioServer: process.env.FORMIO_SERVER || 'http://localhost:3000',
  apiKey: process.env.API_KEY,
  port: process.env.PORT || '3001'
};
