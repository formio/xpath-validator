const funcs = require('../functions');
const q = require('q');

module.exports = (req, res) => {
  let bodies = req.body;
  let isArray = true;
  if (!Array.isArray(req.body)) {
    isArray = false;
    bodies = [bodies];
  }
  console.log(req.url + ': Getting form');
  funcs.getForm(req.url).then(form => {
    return q.all(bodies.map(body => {
      console.log(req.url + ': XPath to Form.io');
      return funcs.xpathToFormio(form.components, body).then(result => {
        console.log(req.url + ': Validating Form');
        return funcs.validateForm(req.url, result, form.components, body).then(result => {
          console.log(req.url + ': Form.io to XPath');
          return funcs.formioToXpath(result, form.components, body).then(result => {
            console.log(req.url + ': Validating Inconsistent results');
            return funcs.validateInconsistent(result, form.components, body).then(result => {
              console.log(req.url + ': Translating errors');
              return funcs.translateError(result, form.components, body)
            });
          });
        });
      });
    }))
      .done((result) => {
        console.log(req.url + ': Request succeeded');
        if (isArray) {
          res.status(200).send(result);
        }
        else {
          res.status(200).send(result[0]);
        }
      });
  }).catch(err => {
    console.log(req.url + ': Error result: ' + err);
    res.status(400).send(err.toString())
  });
};
