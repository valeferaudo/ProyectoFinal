const User = require ('../models/user.model');
const {request, response} = require('express');
const authCtrl ={};
const Cryptr = require('cryptr');


const {generateJWT} = require ('../helpers/jwt');
//Encripta psw
const bycript = require('bcryptjs');
const { populate } = require('../models/user.model');

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
        //SI SE LOGUEA UN USUARIO COMUN --> 'USER' ; SI SE LOGUEA OTRO --> 'CENTER'
        if(type === 'CENTER'){
            if(userDB.role !== 'CENTER-ADMIN' && userDB.role !== 'CENTER-SUPER-ADMIN' && userDB.role !== 'SUPER-ADMIN'){
                return res.status(403).json({
                    ok:false,
                    msg:'User does not have permission in this module'
                });
            }
        }
        if(type === 'USER'){
            if(userDB.role !== 'USER'){
                return res.status(403).json({
                    ok:false,
                    msg:'User does not have permission in this module'
                });
            }
        }
        if(userDB.state === false){
            return res.status(403).json({
                ok:false,
                msg:'User is not allowed'
            });
        }
        var needSportCenter = false;
        if(userDB.role === 'CENTER-SUPER-ADMIN'){
            if(userDB.sportCenter === null){
                needSportCenter = true;
            }
        }
//GENERAR JWT
        const token =  await generateJWT(userDB.id)
        //filtrar el userDB porq muestra todo aca, (psw)
        res.json({
            ok: true,
            msg:"User logged in",
            token: token,
            user: userDB,
            needSportCenter: needSportCenter
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
    var userDB = await User.findById(uid,{uid:1,name:1,lastName:1,address:1,phone:1,email:1,role:1,sportCenter:1,favorites:1})
                                    .populate('sportCenter');
    if(!userDB){
        return console.log('NO ENCUENTRA USUARIO')
    }
    const user = {
        uid: userDB.id,
        name: userDB.name,
        lastName: userDB.lastName,
        address: userDB.address,
        phone: userDB.phone,
        email: userDB.email,
        role: userDB.role,
        sportCenter: userDB.sportCenter,
        favorites: userDB.favorites
    }
    if(user.role === 'CENTER-SUPER-ADMIN'){
        const cryptr = new Cryptr(process.env.CRYTPR);
        user.sportCenter.credentials.accessToken =  cryptr.decrypt(user.sportCenter.credentials.accessToken)
    }
    res.json({
        ok:true,
        user,
        token: token
    })
}


module.exports = authCtrl;