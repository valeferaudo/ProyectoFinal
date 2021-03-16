const User = require ('../models/user.model');
const {request, response} = require('express');
const UserType = require ('../models/userType.model')
const authCtrl ={};

const UserRoleHistorial = require ('../models/userRoleHistorial.model')

const {generateJWT} = require ('../helpers/jwt');
//Encripta psw
const bycript = require('bcryptjs');

authCtrl.login = async(req = request,res = response)=>{
    const { email, password} = req.body;
    const type = req.body.type
    const uid = req.uid
    try {
        const userDB = await  User.findOne({email});
        if (!userDB){
            return res.status(404).json({
                ok:false,
                msg:"Wrong email or password"
            })
        }
        const validatePassword = bycript.compareSync(password , userDB.password);
        if(!validatePassword){
            return res.status(404).json({
                ok:false,
                msg:"Wrong email or password"
            });
        }
        const userRoleHistorial = await UserRoleHistorial.find({user:userDB.id}).sort({'sinceDate' : -1}).limit(1);
        if(userRoleHistorial[0].role !== type){
            return res.status(403).json({
                ok:false,
                msg:'User does not have permission in this module'
            });
        }
        if(userDB.status === false){
            return res.status(403).json({
                ok:false,
                msg:'User is not allowed'
            });
        }
//GENERAR JWT
        const token =  await generateJWT(userDB.id)

        res.json({
            ok: true,
            msg:"User logged in",
            token: token,
            uid
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:"An unexpected error occurred"
        })
    }
}

authCtrl.renewToken = async (req,res)=>{
    const uid = req.uid;
//GENERAR JWT   
    const token =  await generateJWT(uid)    

//OBTENER USUARIO
    var userDB = await User.findById(uid,{uid:1,name:1,secondName:1,address:1,phone:1,email:1,role:1})
                        .populate('role')
    const userRoleHistorial = await UserRoleHistorial.find({user:uid}).sort({'sinceDate' : -1}).limit(1);
    if(!userDB){
        return console.log('NO ENCUENTRA USUARIO')
    }
    const user = {
        uid: userDB.id,
        name: userDB.name,
        secondName: userDB.secondName,
        address: userDB.address,
        phone: userDB.phone,
        email: userDB.email,
        role: userRoleHistorial[0].role
    }
    res.json({
        ok:true,
        user,
        token: token
    })
}


module.exports = authCtrl;