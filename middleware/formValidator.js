const funcs = require('../functions');

module.exports = (req, res) => {
  funcs.getForm(req.url).then(form => {
    funcs.xpathToFormio(req.body.data, form.components).then(data => {
      funcs.validateForm(req.url, {data}, form.components, req.body.data).then(result => {
        funcs.formioToXpath(result, form.components, req.body.data).then(result => {
          result._object = req.body.data;
          result.data = result.data || req.body.data;
          funcs.validateInconsistent(result).then(result => {
            funcs.translateError(result, form.components, req.body.data).then(result => {
              delete result.data;
              res.status(200).send(result);
            }).catch(err => res.status(400).send(err.toString()));
          }).catch(err => res.status(400).send(err.toString()));
        }).catch(err => res.status(400).send(err.toString()));
      }).catch(err => res.status(400).send(err.toString()));
    }).catch(err => res.status(400).send(err.toString()));
  }).catch(err => res.status(400).send(err.toString()));
};
