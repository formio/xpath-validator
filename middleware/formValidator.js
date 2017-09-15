const funcs = require('../functions');

module.exports = (req, res) => {
  funcs.getForm(req.url).then(form => {
    funcs.xpathToFormio(req.body.data, form.components).then(data => {
      funcs.validateForm(req.url, {data}).then(result => {
        if (typeof result === 'boolean') {
          return res.send(result);
        }
        else {
          funcs.translateError(result, form.components, req.body.data).then(error => {
            res.status(400).send(error);
          }).catch(err => res.send(400, err));
        }
      }).catch(err => res.send(400, err));
    }).catch(err => res.send(400, err));
  }).catch(err => res.send(400, err));
};
