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
            param: user
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
    try {
        let users;
        let booleanState;
        let selectedFilters;
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }

        if(searchText === '' && state === '' ){
            users = await User.find({
                id:{$ne: userLoggedID},
                $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
            });
            selectedFilters = [];
        }
        else if(searchText !== '' && state === ''){
            users = await User.find({
                id:{$ne: userLoggedID},
                $or: [
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
                ],
                $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
            })
            selectedFilters = ['Texto: ', searchText];
        }
        else if(searchText === '' && state !== ''){
            users = await User.find({ 
                                            id:{$ne: userLoggedID},
                                            $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
                                            state:booleanState
                                        })
            selectedFilters = ['Estado: ',state];
        }
        else if(searchText !== '' && state !== ''){
            users = await User.find({
                                            id:{$ne: userLoggedID},
                                            $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
                                            state:booleanState,
                                            $or: [
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
                                            ],
            })
            selectedFilters = ['Texto: ', searchText,' - ','Estado: ',state];
        }
        res.json({
            ok: true,
            msg:'Found users',
            param: {
                users,
                selectedFilters
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
        var initialState = false;
        switch (role) {
                case 'USER':
                    initialState = true;
                    break;
                case 'CENTER-ADMIN':
                    initialState = true;
                    break;
                case 'CENTER-SUPER-ADMIN':
                    initialState = false;
                    break;
                case 'SUPER-ADMIN':
                    initialState = true;
                    break;
                default:
                    wrongRoleResponse(res);
        }
        user = new User({
            name: req.body.name,
            lastName: req.body.lastName,
            phone: req.body.phone,
            address: req.body.address,
            email: req.body.email,
            password: req.body.password,
            state: initialState,
            role: req.body.role
        });
        
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password,salt);
        await user.save();
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
        await User.findByIdAndUpdate(uid,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated User'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
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
userCtrl.activateBlockSuperCenterAdmin = async (req = request, res = response) =>{
    const uid = req.params.id;
    const action= req.body.action;
    console.log(action)
    try {
        const userDB = await User.findById(uid)
        if(!userDB){
            return unknownIDResponse(res);
        }
        if(userDB.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(404).json({
                ok:false,
                code: 8,
                msg:'This User doesn´t have to be accepted'
            })
        }
        if (action === 'block'){
            if(userDB.deletedDate !== null){
                return userBlockedResponse(res);
            }
            else{
                userDB.deletedDate = new Date();
            }
        }
        else if (action === 'active'){
            if(userDB.deletedDate === null){
                return userActiveResponse(res);
            }
            else{
                userDB.deletedDate = null;
            }
        }

        userDB.state = !userDB.state;
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        // if (userDB.state === true){
            //ACA VAN LOS ENVIOS DE MAIL---- PROBE PONIENDOLOS ABAJO PPERO NO TESTIE
        // }
        // else{
        // }
        if (action === 'block'){
            sendBlockUser(userDB)
            res.json({
                ok:true,
                msg:'Blocked CENTER-SUPER-ADMIN User'
            })
        }
        else if(action === 'active'){
            sendAcceptUser(userDB)
            res.json({
                ok:true,
                msg:'Activated CENTER-SUPER-ADMIN User'
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
userCtrl.addFavorite = async (req = request, res = response) =>{
    const userID = req.uid;
    const newFavorite = req.params.id;
    try {
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
            for (let i = 0; i < userDB.favorites.length; i++) {
                if (userDB.favorites[i] = newFavorite){
                    this.userDB.favorites.splice(i,1)
                }
            }
            return res.json({
                ok:true,
                msg: 'Favorite item deleted'
            })
        }
        this.userDB.favorites.push(newFavorite);
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        // sendAcceptUser(userDB)
        res.json({
            ok:true,
            msg:'Favorite item added'
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
            return wrongPasswordResponse(res);
        }
        if(passwords.NewPassword !== passwords.RepeatNewPassword){
            return wrongPasswordResponse(res);
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
function wrongPasswordResponse(res){
    return res.status(404).json({
        ok:false,
        code: 9,
        msg:'Password doesen´t match'
    })
}
module.exports = userCtrl;