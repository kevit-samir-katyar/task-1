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
 */
router.delete('/user/me/logout',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
});


/**
 * Export Router
 */
module.exports = router;
