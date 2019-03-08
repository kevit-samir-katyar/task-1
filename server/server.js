const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID}=require('mongodb');
var multer = require('multer');
const {mongoose} = require('./db/mongoose');
const {User}=require('./model/users');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const {authenticate}=require('./../middleware/authenticate')

var app=express();
app.use(bodyParser.json());
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

// New User 

app.post('/users', (req,res)=>{
    var body = _.pick(req.body,['email','password','address','name','phone'])
    var user = User(body);
   
    user.save().then((user)=>{
        return user.generateAuthToken();
        }).then((token)=>{
            res.header('x-auth',token).send(user);
        }).catch((e)=>{
        res.status(400).send();
    });
});

//Search User

app.get('/usera',authenticate,(req,res)=>{
    var body =req.body.name;
    
    User.findByName(body).then((doc)=>{   
        console.log(doc);
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


// Upload Photo

app.post('/profile', upload.single('avatar'), function (req, res) {
   
   var token = req.header('x-auth');
   console.log(token);
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

// show Photo
 app.get('/profilePhoto/:name',(req,res)=>{
    var body =req.params.name;
    console.log(body);
    User.findByName(body).then((doc)=>{   
        console.log(doc);
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



// User Login

 app.post('/user/login' ,(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    
    User.findByCredentials(body.email,body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user); 
        });
    }).catch((e)=>{
        res.status(400).send(); 
    });
});
//Logout
app.delete('/user/me/token',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
});

//Update User Deatail 

app.patch('/users',authenticate, (req,res)=>{
    var body = _.pick(req.body,['address','password','name','phone']);
    var token = req.header('x-auth');
    User.findByUser(token).then((result)=>{       
        var id = result._id;
      
    
        User.findOneAndUpdate(id, {$set:body},{new:true}).then((result)=>{
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




app.listen(3000,()=>{
    console.log('Started listening on port 3000');
});