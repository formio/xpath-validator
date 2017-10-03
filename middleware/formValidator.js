const funcs = require('../functions');

module.exports = (req, res) => {
  funcs.getForm(req.url).then(form => {
    funcs.xpathToFormio(req.body, form.components).then(data => {
      funcs.validateForm(req.url, {data}, form.components, req.body).then(result => {
        funcs.formioToXpath(result, form.components, req.body).then(result => {
          result._object = req.body;
          result.data = result.details.length ? result.data : req.body;
          funcs.validateInconsistent(result).then(result => {
            funcs.translateError(result, form.components, req.body).then(result => {
              res.status(200).send(result);
            }).catch(err => res.status(400).send(err.toString()));
          }).catch(err => res.status(400).send(err.toString()));
        }).catch(err => res.status(400).send(err.toString()));
      }).catch(err => res.status(400).send(err.toString()));
    }).catch(err => res.status(400).send(err.toString()));
  }).catch(err => res.status(400).send(err.toString()));
};
