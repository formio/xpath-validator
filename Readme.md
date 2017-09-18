# XPath Validator

## Description
The XPath Validator is a nodejs express application that operates as a Validation API interface with Form.io. It will accept an xpath based data model and perform a transformation and validate the data against a Form.io form.

## Installation
To install this library, clone the repository from https://github.com/formio/xpath-validator

Then run
```bash
npm install
```

## Configuration
This application is configured using environment variables. These can either be set using the normal environment settings or via a .env file in the root of the project.

### Environment Variables
 - FORMIO_SERVER - This is the full url to the project url to validate against. Example: https://myproject.form.io
 - API_KEY - The secret key configured in the project. Example: abcdef123456
 - PORT - The port to run this application on. Example: 80

## Run
To run this application, make sure all environment variables are configured and type the following.

```bash
npm start
```

## Configuring the form
In your project, create a form and add fields to it with the proper validation. Then go to the API tab for each component and open the ```Custom Properties``` option. Add an ```xpath``` property with whatever xpath you want. For example: /customer/firstname

## Making the request
Once you have configured your form you can make a request to this server to check the validation of some data. Use the xpath for each property set on the field. To do this, POST to this server's url with the form and formId from the form on the formio project.

For example:
POST https://xpathvalidator.myserver.com/form/abc123 (where abc123 is the formId of the form on the formio projecT).
body:
```json
{
  "data": {
    "/customer/firstname": "John",
    "/customer/lastname": "Doe"
  }
}
```

## Return
If validation is successful, returns 200 - true

If validation fails, returns 400 - object