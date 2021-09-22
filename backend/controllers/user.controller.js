const User = require ('../models/user.model');
const Field = require ('../models/field.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response, text} = require ('express');
const userCtrl = {};
const bcrypt = require('bcryptjs');

//Mails
const { sendNewUserEmail } = require ('../helpers/emails/newUserEmail');
const { sendAcceptUser } = require ('../helpers/emails/acceptUserEmail');
const { sendBlockUser } = require ('../helpers/emails/blockUserEmail');
const { sendNewPasswordEmail } = require ('../helpers/emails/newPasswordEmail');


userCtrl.getUser = async (req = request,res = response)=>{
    uid = req.params.uid;
    try {
        const user = await User.findById(uid)
        if (!user) {
            return unknownIDResponse(res);
        }
        res.json({
            ok: true,
            msg:'Found user',
            param: {user}
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.getUsers = async (req = request,res = response)=>{
    userLoggedID = req.uid
    searchText = req.query.text;
    state = req.query.state;
    userType = req.query.userType;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        let users;
        let booleanState;
        let selectedFilters = [];
        const userDB = await User.findById(userLoggedID)
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }
        let query = {
            '$and': []
        };
        searchText !== '' ? query['$and'].push({ $or: [
                                                        {"name" : new RegExp(searchText, 'i')},
                                                        {"lastName" : new RegExp(searchText, 'i')},
                                                        {$expr: {
                                                            "$regexMatch": {
                                                                "input": { "$concat": ["$name", " ", "$lastName"] },
                                                                "regex": searchText,
                                                                "options": "i"
                                                            }
                                                        }},
                                                        {$expr: {
                                                            "$regexMatch": {
                                                                "input": { "$concat": ["$lastName", " ", "$name"] },
                                                                "regex": searchText,
                                                                "options": "i"
                                                            }
                                                        }}
                                                    ]}) : query ;
        if (state !== ''){
            query['$and'].push({state: booleanState})
        }
        query['$and'].push({_id: {$ne: userLoggedID}})
        query['$and'].push({role: {$ne: 'SUPER-ADMIN'}})
        if(userType === 'SUPER-ADMIN'){
            query['$and'].push({$and: [{role: {$ne: 'CENTER-ADMIN'}},{role: {$ne: 'USER'}}]})
        }
        else if (userType === 'CENTER-SUPER-ADMIN'){
            query['$and'].push({sportCenter: userDB.sportCenter})
        }
        if(searchText !== ''){
            selectedFilters.push(`"${searchText}"`)
        }
        if (state !== ''){
            selectedFilters.push(state);
        }
        if(query['$and'].length > 0){
            [users,total] = await Promise.all([User.find(query).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                   User.find(query).countDocuments()
                                               ])
       }else{
            [users,total] = await Promise.all([User.find().skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                   User.find().countDocuments()
                                               ])
       }
       total = Math.ceil(total / registerPerPage);
       res.json({
            ok: true,
            msg:'Found users',
            param: {
                users,
                selectedFilters,
                paginator:{
                    totalPages: total,
                    page: page
                }
            }
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.createUser = async (req = request, res = response) =>{
    const {email, password, role} = req.body
    try {
        const existsEmail = await User.findOne({email});
        if(existsEmail){
            return existsEmailResponse(res);
        }
        let initialState = false;
        let debtNotification = false;
        let paymentNotification = false;
        switch (role) {
                case 'USER':
                    initialState = true;
                    debtNotification = null;
                    paymentNotification = null;
                    break;
                case 'CENTER-ADMIN':
                    initialState = true;
                    debtNotification = true;
                    paymentNotification = true;
                    break;
                case 'CENTER-SUPER-ADMIN':
                    initialState = false;
                    debtNotification = true;
                    paymentNotification = true;
                    break;
                case 'SUPER-ADMIN':
                    initialState = true;
                    debtNotification = null;
                    paymentNotification = null;
                    break;
                default:
                    wrongRoleResponse(res);
        }
        let sportCenter
        if(req.body.role === 'CENTER-ADMIN'){
            sportCenter = req.body.sportCenter
        }
        else{
            sportCenter = null;
        }
        user = new User({
            name: req.body.name,
            lastName: req.body.lastName,
            phone: req.body.phone,
            address: req.body.address,
            email: req.body.email,
            password: req.body.password,
            state: initialState,
            sportCenter: sportCenter,
            role: req.body.role,
            debtNotification: debtNotification,
            paymentNotification: paymentNotification
        });
        
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password,salt);
        const newUser = await user.save();
        if(req.body.role === 'CENTER-SUPER-ADMIN'){
            sendNewUserEmail(user);
        }
        res.json({
            ok:true,
            msg: 'Created User',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.updateUser = async (req = request, res = response) =>{
    const uid = req.params.id
    const email = req.body.email
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        //si no modifica el email (porque sino chocan por ser iguales)
        if(changes.email === userDB.email){
            delete changes.email
        }else{
            const existsEmail = await User.findOne({email});
            if(existsEmail){
                return existsEmailResponse(res);
            }
        }
        //Si un center-admin o super-center-admin cambia de role, si o si tiene que ser a center-super-admin o a center-admin
        // un user o super-admin no puede cambiar su role.
        if(changes.role !== undefined){
            if (userDB.role !== 'USER' || userDB.role !== 'SUPER-ADMIN'){
                if(changes.role !== 'CENTER-SUPER-ADMIN' && changes.role !== 'CENTER-ADMIN'){
                    return wrongRoleResponse(res);
                }
            }
            else{
                return res.status(403).json({
                    ok:false,
                    code: 1,
                    msg: 'This User doesn´t have the permissions'
                })
            }
            if(changes.role === userDB.role){
                delete changes.role
            }
        }
        const user = await User.findByIdAndUpdate(uid,changes,{new:true}).populate('sportCenter')
        res.json({
            ok:true,
            msg:'Updated User',
            param: {
                user
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.activateBlockUser = async (req = request, res = response) =>{
    const uid = req.params.id;
    const action= req.body.action;
    try {
        const userDB = await User.findById(uid)
        if(!userDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(userDB.state === false){
                return userBlockedResponse(res);
            }
            else{
                userDB.deletedDate = new Date();
            }
        }
        else if (action === 'active'){
            if(userDB.state === true){
                return userActiveResponse(res);
            }
            else{
                userDB.deletedDate = null;
            }
        }
        userDB.state = !userDB.state;
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        if(userDB.role === 'CENTER-SUPER-ADMIN'){
            if (action === 'block'){
                sendBlockUser(userDB);
                users = await User.find({$and:[{sportCenter:userDB.sportCenter},{state:true},{deletedDate: null}]})
                if(users.length === 0){
                    await SportCenter.findByIdAndUpdate(userDB.sportCenter,{deletedDate: new Date()})
                    await Field.updateMany({sportCenter: userDB.sportCenter},{deletedDate: new Date()})
                    fieldIDs = await Field.find({sportCenter: userDB.sportCenter},'id')
                    let ids=[];
                    fieldIDs.forEach(element => {
                        ids.push((element._id).toString())
                    });
                    ids.push((userDB.sportCenter).toString());
                    await User.updateMany({},{$pull:{favorites:{$in:ids}}})
                }
                res.json({
                    ok:true,
                    msg:'Blocked CENTER-SUPER-ADMIN User'
                })
            }
            else if(action === 'active'){
                sendAcceptUser(userDB)
                users = await User.find({$and:[{sportCenter:userDB.sportCenter},{state:true},{deletedDate: null}]})
                if(users.length === 1){
                    await SportCenter.findByIdAndUpdate(userDB.sportCenter,{deletedDate: null})
                }
                res.json({
                    ok:true,
                    msg:'Activated CENTER-SUPER-ADMIN User'
                })
            }
        }
        else{
            if (action === 'block'){
                res.json({
                    ok:true,
                    msg:'Blocked User'
                })
            }
            else if(action === 'active'){
                res.json({
                    ok:true,
                    msg:'Activated User'
                })
            }
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.changeRole = async (req = request, res = response) =>{
    const uid = req.params.id;
    try {
        const userDB = await User.findById(uid)
        if(!userDB){
            return unknownIDResponse(res);
        }
        if (userDB.role === 'CENTER-SUPER-ADMIN'){
            userDB.role = 'CENTER-ADMIN'
        }
        else if (userDB.role === 'CENTER-ADMIN'){
            userDB.role = 'CENTER-SUPER-ADMIN'
        }
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        res.json({
            ok:true,
            msg:'Changed User role'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.addRemoveFavorite = async (req = request, res = response) =>{
    const userID = req.uid;
    const newFavorite = req.params.id;
    try {
        let newUser;
        const userDB = await User.findById(userID);
        if(userDB.deletedDate !== null){
            return userBlockedResponse(res);
        }
        const fieldDB = await Field.findById(newFavorite);
        const sportCenterDB = await SportCenter.findById(newFavorite);
        if (fieldDB === {} || sportCenterDB === {}){
            return unknownIDResponse(res);
        }
        if (userDB.favorites.includes(newFavorite)){
            userDB.favorites.splice(userDB.favorites.indexOf(newFavorite),1)
            newUser = await User.findByIdAndUpdate(userID,userDB,{new:true});
            return res.json({
                ok:true,
                msg: 'Favorite item deleted',
                param: {
                    user: newUser
                }
            })
        }else{
            userDB.favorites.push(newFavorite);
            newUser = await User.findByIdAndUpdate(userID,userDB,{new:true});
        }
        res.json({
            ok:true,
            msg:'Favorite item added',
            param: {
                user: newUser
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.getFavorites = async (req = request, res = response) => {
    const userID = req.uid;
    type = req.query.type;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        const userDB = await User.findById(userID);
        if(userDB.deletedDate !== null){
            return userBlockedResponse(res);
        }
        if(type === 'field'){
            [favorites,total] = await Promise.all([Field.find({ _id : { $in : userDB.favorites } }).populate('sportCenter').populate('sports.sport').skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                Field.find({ _id : { $in : userDB.favorites } }).populate('sportCenter').populate('sports.sport').countDocuments()
                                               ])
        }else if(type === 'sportCenter'){
            [favorites,total] = await Promise.all([SportCenter.find({ _id : { $in : userDB.favorites } }).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                SportCenter.find({ _id : { $in : userDB.favorites } }).countDocuments()
                                               ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok:true,
            msg:'Found Favorite items',
            param: {
                favorites,
                paginator:{
                    totalPages: total,
                    page: page
                }
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.changePassword = async (req = request, res = response) =>{
    const userID = req.params.id;
    const passwords = req.body;
    try {
        const userDB = await User.findById(userID)
        if (!userDB) {
            return unknownIDResponse(res);
        }
        //verificar contraseña vieja
         if (!(bcrypt.compareSync(passwords.OldPassword, userDB.password))) {
            return wrongOldPasswordResponse(res);
        }
        if(passwords.NewPassword !== passwords.RepeatNewPassword){
            return wrongNewPasswordResponse(res);
        }
        const salt = bcrypt.genSaltSync();
        const newPassword = bcrypt.hashSync(passwords.NewPassword,salt);
        await User.findByIdAndUpdate(userID,{ $set:{password:newPassword}},{new:true})
        res.json({
            ok:true,
            msg: 'Updated User Password',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.forgetPassword = async (req = request, res = response) =>{
    const email = req.body.email;
    try {
        const userDB = await User.find({email: email})
        if (!userDB) {
            return unknownEmailResponse(res);
        }
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let password = '';
        for ( let i = 1; i <= 8 ; i++ ) {
            password += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        const salt = bcrypt.genSaltSync();
        const newPassword = bcrypt.hashSync(password,salt);
        console.log(userDB)
        await User.findByIdAndUpdate(userDB[0]._id,{ $set:{password:newPassword}},{new:true})
        sendNewPasswordEmail(email,password)
        res.json({
            ok:true,
            msg: 'Updated User Password',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.changeNotification = async (req = request, res = response) =>{
    const userID = req.uid;
    const type = req.body.type;
    const state = req.body.state;
    try {
        let user;
        if(type === 'nonPayment'){
            user = await User.findByIdAndUpdate(userID,{ $set:{paymentNotification:state}},{new:true})
        }else if(type === 'debt'){
            user = await User.findByIdAndUpdate(userID,{ $set:{debtNotification:state}},{new:true})
        }
        res.json({
            ok:true,
            msg: 'Updated User Notifications',
            param:{
                user
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
function errorResponse(res){
    res.status(500).json({
        ok:false,
        code: 99,
        msg:'An unexpected error occurred'
    })
}
function unknownIDResponse(res){
    return res.status(404).json({
        ok:false,
        code: 3,
        msg:'Unknown ID. Please insert a correct ID'
    })
}
function unknownEmailResponse(res){
    return res.status(404).json({
        ok:false,
        code: 23,
        msg:'Unknown Email. Please insert a correct Email'
    })
}
function existsEmailResponse(res){
    return res.status(400).json({
        ok:false,
        code: 4,
        msg:'An user already exists with this email'
    })
}
function wrongRoleResponse(res){
    return res.status(400).json({
        ok:false,
        code: 5,
        msg:'User role is wrong'
    });
}
function userBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This User is blocked'
    })
}
function userActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This User is active'
    })
}
function wrongOldPasswordResponse(res){
    return res.status(404).json({
        ok:false,
        code: 9,
        msg:'Old Password doesen´t match'
    })
}
function wrongNewPasswordResponse(res){
    return res.status(404).json({
        ok:false,
        code: 11,
        msg:'New Password doesen´t match'
    })
}
// no se usan creo
userCtrl.deleteUser = async (req = request, res = response) =>{
    const uid = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return unknownIDResponse(res);
        }
        if(userDB.deletedDate !== null){
            return userBlockedResponse(res);
        }
        userDB.deletedDate = Date.now();
        await User.findByIdAndUpdate(uid,userDB,{new:true})
        res.json({
            ok:true,
            msg:'Deleted User'
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.activateUser = async (req = request, res = response) =>{
    const uid = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return unknownIDResponse(res);
        }
        if(userDB.deletedDate === null){
            return userActiveResponse(res);
        }
        userDB.deletedDate = null;
        await User.findByIdAndUpdate(uid,userDB,{new:true})
        res.json({
            ok:true,
            msg:'Activated User'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
module.exports = userCtrl;