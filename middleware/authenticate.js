const {User}=require('./../server/model/users');

var authenticate = (req,res,next)=>{
    var token = req.header('x-auth');

    User.findByToken(token).then((result)=>{
        
        if(!result){
            
            return Promise.reject();
        }
        req.token = token;
        req.user = result;
        next();
    }).catch((e)=>{
        res.status(401).send();
    });
};

module.exports={authenticate}