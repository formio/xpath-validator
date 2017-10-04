const funcs = require('../functions');
const q = require('q');

module.exports = (req, res) => {
  let bodies = req.body;
  let isArray = true;
  if (!Array.isArray(req.body)) {
    isArray = false;
    bodies = [bodies];
  }
  funcs.getForm(req.url).then(form => {
    return q.all(bodies.map(body => {
      return funcs.xpathToFormio(form.components, body).then(result => {
        return funcs.validateForm(req.url, result, form.components, body).then(result => {
          return funcs.formioToXpath(result, form.components, body).then(result => {
            return funcs.validateInconsistent(result, form.components, body).then(result => {
              return funcs.translateError(result, form.components, body).then(result => {
                return result;
              })
            });
          });
        });
      });
    }))
      .done((result) => {
        if (isArray) {
          res.status(200).send(result);
        }
        else {
          res.status(200).send(result[0]);
        }
      });
  }).catch(err => res.status(400).send(err.toString()));
};
