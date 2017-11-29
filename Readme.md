# XPath Validator

## Description
The XPath Validator is a nodejs express application that operates as a Validation API interface with Form.io. It will accept an xpath based data model and perform a transformation and validate the data against a Form.io form.

**Formio Server Version** Please note that the validator will only work against Formio Server versions 4.2.1 or 5.0.0-rc.11 or later.

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
In your project, create a form and add fields to it with the proper validation. Then go to the API tab for each component and open the ```Custom Properties``` option. Add an ```xpath``` property with whatever xpath you want. For example: Customer/firstname

Each field should contain the FULL xpath path to the value.

Fields in a datagrid must contain a [#n] in the xpath for each datagrid deep.

For example, create the following fields within a datagrid inside a datagrid:
 - Customer[#n]/children[#n]/name
 - Customer[#n]/children[#n]/age
 
Multiple value fields must end in [#n]

For example:
 - Options[#n]

## Making the request
Once you have configured your form you can make a request to this server to check the validation of some data. Use the xpath for each property set on the field. To do this, POST to this server's url with the form and formId from the form on the formio project.

For example:
POST https://xpathvalidator.myserver.com/form/abc123 (where abc123 is the formId of the form on the formio projecT).
body:
```json
{
    "Customer/firstname": "John",
    "Customer/lastname": "Doe",
    "Customer#1/children#1/name": "frank",
    "Customer#1/children#2/name": "Becky"
}
```

## Return
If validation is successful, returns 200 - object

```
{
    "status": "ValidationSuccess",
    "errors": [],
    "_object": {
        "Customer/firstname": "John",
        "Customer/lastname": "Doe",
        "Customer#1/children#1/name": "frank",
        "Customer#1/children#2/name": "Becky"
    }
}
```

If validation fails, returns 200 - object
For example

```json
{
    "status": "ValidationError",
    "errors": [
        {
            "key": "Customer/lastname",
            "instanceId": "Customer/lastname",
            "value": "",
            "type": "MISSING",
            "message": "\"lastName\" is required"
        },
        {
            "key": "Customer[#n]/children[#n]/age",
            "instanceId": "Customer#1/children#1/age",
            "value": "",
            "type": "MISSING",
            "message": "\"age\" is required"
        },
        {
            "key": "Customer[#n]/children[#n]/name",
            "instanceId": "Customer#1/children#2/name",
            "value": "",
            "type": "INVALID",
            "message": "\"name\" must be frank"
        },
        {
            "key": "Customer[#n]/children[#n]/age",
            "instanceId": "Customer#1/children#2/age",
            "value": "",
            "type": "MISSING",
            "message": "\"age\" is required"
        },
        {
            "key": "/bad",
            "instanceId": "/bad",
            "value": "bad",
            "type": "INCONSISTENT",
            "message": "Value is not consistent with other answers"
        }
    ],
    "_object": {
        "Customer/firstname": "Joe",
        "/bad": "bad",
        "Customer#1/children#1/name": "frank",
        "Customer#1/children#2/name": "Becky"
    }
}
```
