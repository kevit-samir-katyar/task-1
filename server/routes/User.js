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
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })




var fileName;
var diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
         filename: function (req, file, cb) {
            var fileType=file.mimetype.split('/');
            fileName=file.fieldname.toString('hex') + Date.now()+ '.'+fileType[1];
                        cb(null,fileName); 
        }
       });
  var upload = multer({ storage: diskStorage });      


/**
 * Router Definitions
 */

 /*
    Add User
 */
router.post('/users', (req,res)=>{
    var body = _.pick(req.body,['email','password','address','name','phone'])
    var user = User(body);
   
    user.save().then((user)=>{
            res.send(user);
        }).catch((e)=>{
        res.status(400).send(e);
    });
});

/*
    Search User
*/

router.get('/user',authenticate,(req,res)=>{
    var body =req.body.name;
    
    User.findByName(body).then((doc)=>{ 
        if(doc.tokens.length < 1)
        {
            var body ={
                name:doc.name,
                address:doc.address,
                photo :doc.photo
            }
            res.send(body);  
        }
        if(doc.tokens[0].token !== req.header('x-auth'))
        {
            var body ={
                name:doc.name,
                address:doc.address,
                photo :doc.photo
            }
            res.send(body);   
        }
        var abc ={
            name:doc.name,
            address:doc.address,
            email:doc.email,
            photo:doc.photo
        }
        res.send(abc);   
    },(e)=>{
        res.status(401).send(e);
    })
});
/*
     Upload Photo Of User 
*/

router.post('/profile', authenticate, upload.single('avatar'), function (req, res) {
   
         User.findByUser(req.header('x-auth')).then((result)=>{       
             var id = result._id;
             
             result.photo = 'D:/Kevit/Task/uploads/'+ fileName;
             
             User.findOneAndUpdate({_id :result._id} , {$set:result} , {new :true}) .then((data)=>{
                 console.log(data);
                 if(!data){
                     res.send('Profile Photo Uplodad');
                 }
                 res.send(data);
 
             });
           
         }).catch((e)=>{
             res.status(401).send();
         });
  });
 
 /* 
    View  Photo
*/
router.get('/profilePhoto/:name',authenticate,(req,res)=>{
     var body =req.params.name;
     
     User.findByName(body).then((doc)=>{   
         
         if(doc.tokens[0].token !== req.header('x-auth'))
         {
             var body ={
                 photo : doc.photo
             }
             res.send(body);   
         }
         var abc ={
             photo:doc.photo
         }
         res.send(abc);   
     },(e)=>{
         res.status(401).send(e);
     })
 });
 

 
/* 
 Update User Detail
*/
 
router.patch('/users',authenticate, (req,res)=>{
    var body = _.pick(req.body,['address','password','name','phone']);
    var token = req.header('x-auth');
    User.findByUser(token).then((result)=>{       
        
        User.findOneAndUpdate({_id :result._id}, {$set:body},{new:true}).then((result)=>{
            if(!result){
                return res.status(404).send('No user with given name found!');
            }
            res.status(200).send(result);
        });
        res.send(result);
    }).catch((e)=>{
        res.status(401).send(e);
    });
        
 
    
});

/**
 * Export Router
 */
module.exports = router;

