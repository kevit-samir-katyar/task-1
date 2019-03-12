
const express = require('express');
const bodyParser = require('body-parser');

var app=express();
app.use(bodyParser.json());


let User = require('./server/routes/User');
app.use('/', User);

let Login = require('./server/routes/login');
app.use('/', Login);

let Logout = require('./server/routes/logout');
app.use('/', Logout);


module.exports = app;