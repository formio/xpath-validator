// Allow loading .env file for environment variables.
require('dotenv').load({silent: true});

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const cors = require('cors');

const config = require('./config');

const funcs = require('./functions');

// Use the express application.
const app = express();

// Create the app server.
app.server = http.createServer(app);

app.use(cors());

app.use(favicon('./favicon.png'));

// Add Middleware necessary for REST APIs
app.use(bodyParser.urlencoded({extended: true, limit: '16mb'}));
app.use(bodyParser.json({limit: '16mb'}));

app.post('/form/:formId', (req, res, next) => {
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
});

app.use((req, res) => {
  res.status(404).send('Unknown path');
});

// Start the server.
console.log('Listening on port ' + config.port);
app.listen(config.port);