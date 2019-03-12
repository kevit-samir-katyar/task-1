/**
 * Router Configuration Files
 */

/**
 * System and 3rd party libs
 */
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID}=require('mongodb');
const {mongoose} = require('../db/mongoose');
const {User}=require('../model/users');
var multer  = require('multer');
const {authenticate}=require('../../middleware/authenticate');
const router = express.Router();

/**
 * Router Definitions
 * Login for User
 */

router.post('/user/login' ,(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    
    User.findByCredentials(body.email,body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user); 
        });
    }).catch((e)=>{
        res.status(400).send(); 
    });
});
/**
 * Export Router
 */
module.exports = router;
