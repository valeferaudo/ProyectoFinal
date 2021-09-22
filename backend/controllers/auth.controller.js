const User = require ('../models/user.model');
const Appointment = require ('../models/appointment.model');
const Payment = require ('../models/payment.model');
const Debt = require ('../models/debt.model')
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
                msg:"Wrong email or password",
                code:22
            })
        }
        const validatePassword = bycript.compareSync(password , userDB.password);
        if(!validatePassword){
            return res.status(404).json({
                ok:false,
                msg:"Wrong email or password",
                code: 22
            });
        }
        //SI SE LOGUEA UN USUARIO COMUN --> 'USER' ; SI SE LOGUEA OTRO --> 'CENTER'
        if(type === 'CENTER'){
            if(userDB.role !== 'CENTER-ADMIN' && userDB.role !== 'CENTER-SUPER-ADMIN' && userDB.role !== 'SUPER-ADMIN'){
                return res.status(403).json({
                    ok:false,
                    msg:'User does not have permission in this module',
                    code: 5
                });
            }
        }
        if(type === 'USER'){
            if(userDB.role !== 'USER'){
                return res.status(403).json({
                    ok:false,
                    msg:'User does not have permission in this module',
                    code: 5
                });
            }
        }
        if(userDB.state === false || userDB.deletedDate !== null){
            return res.status(403).json({
                ok:false,
                msg:'User is not allowed',
                code: 5
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
    var userDB = await User.findById(uid,{uid:1,name:1,lastName:1,address:1,phone:1,email:1,role:1,sportCenter:1,favorites:1,debtNotification:1,paymentNotification:1})
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
        favorites: userDB.favorites,
        paymentNotification: userDB.paymentNotification,
        debtNotification: userDB.debtNotification
    }
    if(user.role === 'CENTER-SUPER-ADMIN'){
        const cryptr = new Cryptr(process.env.CRYTPR);
        if(user.sportCenter.credentials.accessToken !== null){
            user.sportCenter.credentials.accessToken =  cryptr.decrypt(user.sportCenter.credentials.accessToken)
        }
    }
    let appointments = [];
    let debts = [];
    let payments = [];
    if(user.role === 'CENTER-SUPER-ADMIN' || user.role === 'CENTER-ADMIN'){
        if(userDB.paymentNotification && userDB.sportCenter.paymentRequired){
            appointments = await Appointment.find({$and:[{state:{$ne:'Completed'}},{payments:[]},{sportCenter: userDB.sportCenter}]}).populate({
                                                                                                path: "user",
                                                                                                match: {
                                                                                                    role: {$nin :['USER','SUPER-ADMIN']},
                                                                                                }})
        }
        if(userDB.debtNotification){
            debts = await Debt.find({$and:[{centerApprove:false},{sportCenter: userDB.sportCenter}]})
        }
        payments = await Payment.find({$and:[{appointmentSportCenter: userDB.sportCenter},{state:'PENDING'}]});
    }
    res.json({
        ok:true,
        user,
        token: token,
        haveDebt: debts.length !== 0 ? true : false,
        nonPayment: appointments.length !== 0 ? true : false,
        pendingPayment: payments.length !== 0 ? true : false,
    })
}


module.exports = authCtrl;