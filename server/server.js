const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID}=require('mongodb');

const {mongoose} = require('./db/mongoose');
const {User}=require('./model/users');

const {authenticate}=require('./../middleware/authenticate')

var app=express();
app.use(bodyParser.json());


// New User 

app.post('/users', (req,res)=>{
    var body = _.pick(req.body,['email','password','address','name'])
    var user = User(body);
   
    user.save().then((user)=>{
        return user.generateAuthToken();
        }).then((token)=>{
            res.header('x-auth',token).send(user);
        }).catch((e)=>{
        res.status(400).send();
    });
});

// Authentication
app.get('/user/me',authenticate,(req,res)=>{
    res.send(req.user);
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

//Update
app.patch('/users/:email', (req,res)=>{
    var name=req.params.email;
    
    User.findOneAndUpdate({
        name:name
    }, {$set:req.body},{new:true}).then((result)=>{
        if(!result){
            return res.status(404).send('No user with given name found!');
        }
        res.status(200).send(result);
    }
,(err)=>{
    res.status(400).send('Bad request',err);
})
});



app.listen(3000,()=>{
    console.log('Started listening on port 3000');
});