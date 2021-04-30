const User = require ('../models/user.model');
const Field = require ('../models/field.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response, text} = require ('express');
const userCtrl = {};
const bcrypt = require('bcryptjs');
const UserRoleHistorial = require ('../models/userRoleHistorial.model');

//Mails
const { sendNewUserEmail } = require ('../helpers/emails/newUserEmail');
const { sendAcceptUser } = require ('../helpers/emails/acceptUserEmail');
const { sendBlockUser } = require ('../helpers/emails/blockUserEmail');



userCtrl.getUser = async (req = request,res = response)=>{
    uid = req.params.uid;
    try {
        const user = await User.findById(uid)
        if (!user) {
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        res.json({
            ok: true,
            msg:'Found user',
            param: user
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
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
            users = await User.find({deletedDate: null, 
                id:{$ne: userLoggedID},
                $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
            });
            selectedFilters = [];
        }
        else if(searchText !== '' && state === ''){
            users = await User.find({deletedDate: null, 
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
        else if(text === '' && state !== ''){
            users = await User.find({deletedDate: null, 
                                            id:{$ne: userLoggedID},
                                            $and :[{role:{$ne:'CENTER-ADMIN'}},{role:{$ne:'SUPER-ADMIN'}}],
                                            state:booleanState
                                        })
            selectedFilters = ['Estado: ',state];
        }
        else if(text !== '' && state !== ''){
            users = await User.find({deletedDate: null, 
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
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.createUser = async (req = request, res = response) =>{
    const {email, password, role} = req.body
    try {
        const existsEmail = await User.findOne({email});
        if(existsEmail){
            return res.status(400).json({
                ok:false,
                msg:'An user already exists with this email'
            })
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
                    return res.status(400).json({
                        ok:false,
                        msg:'User role is wrong'
                    });
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
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

userCtrl.updateUser = async (req = request, res = response) =>{
    const uid = req.params.id
    const email = req.body.email
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        const changes = req.body;
        //si no modifica el email (porque sino chocan por ser iguales)
        if(changes.email === userDB.email){
            delete changes.email
        }else{
            const existsEmail = await User.findOne({email});
            if(existsEmail){
                return res.status(400).json({
                    ok:false,
                    msg:'An user already exists with this email'
                })
            }
        }
        // if(changes.password === null){
        //     delete changes.password
        // }else{
        //     const salt = bcrypt.genSaltSync();
        //     changes.password = bcrypt.hashSync(changes.password,salt);
        // }
        // const userRole = await UserRoleHistorial.findOne({user:uid}).sort({'sinceDate' : -1}).limit(1);
        if (userDB.role !== 'USER'){
            if(changes.role !== 'CENTER-SUPER-ADMIN' && changes.role !== 'CENTER-ADMIN'){
                return res.status(403).json({
                    ok:false,
                    msg:'User role is wrong'
                });
            }
        }
        if(changes.role !== undefined){
            if(userDB.role === 'USER' || userDB.role === 'SUPER-ADMIN'){
                return res.status(403).json({
                    ok:false,
                    msg:'User role is not allowed to change his role'
                });
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
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.deleteUser = async (req = request, res = response) =>{
    const uid = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if(userDB.deletedDate !== null){
            return res.status(404).json({
                ok:false,
                msg:'This User is already blocked'
            })
        }
        userDB.deletedDate = Date.now();
        await User.findByIdAndUpdate(uid,userDB,{new:true})
        res.json({
            ok:true,
            msg:'Deleted User'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.activateUser = async (req = request, res = response) =>{
    const uid = req.params.id;
    try {
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if(userDB.deletedDate === null){
            return res.status(404).json({
                ok:false,
                msg:'This User is already active'
            })
        }
        userDB.deletedDate = null;
        await User.findByIdAndUpdate(uid,userDB,{new:true})
        res.json({
            ok:true,
            msg:'Activated User'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

userCtrl.activateBlockSuperCenterAdmin = async (req = request, res = response) =>{
    const superAdminID = req.uid;
    const uid = req.params.id;
    try {
        const superAdminBD = await User.findById(superAdminID)
        if(superAdminBD.role !== 'SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions'
            })
        }
        const userDB = await User.findById(uid)
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if(userDB.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(404).json({
                ok:false,
                msg:'This User role doesn´t have to be accepted'
            })
        }
        if(userDB.deletedDate !== null){
            return res.status(403).json({
                ok:false,
                msg:'This User is deleted'
            })
        }
        userDB.state = !userDB.state;
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        if (userDB.state === true){
            sendAcceptUser(userDB)
        }
        else{
            sendBlockUser(userDB)
        }
        res.json({
            ok:true,
            msg:'Activated CENTER-SUPER-ADMIN User'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.addFavorite = async (req = request, res = response) =>{
    const userID = req.uid;
    const newFavorite = req.params.id;
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if(userDB.role !== 'USER'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to add favorites'
            })
        }
        if(userDB.deletedDate !== null){
            return res.status(403).json({
                ok:false,
                msg:'This User is deleted'
            })
        }
        const fieldDB = await Field.findById(newFavorite);
        const sportCenterDB = await SportCenter.findById(newFavorite);
        if (fieldDB === {} || sportCenterDB === {}){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Field ID or SportCenter ID'
            })
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
        sendAcceptUser(userDB)
        res.json({
            ok:true,
            msg:'Favorite item added'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.changePassword = async (req = request, res = response) =>{
    const userID = req.params.id;
    const userLoggedID = req.uid
    const passwords = req.body;
    try {
        const userDB = await User.findById(userID)
        if (!userDB) {
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if (userID !== userLoggedID){
            return res.status(403).json({
                ok:false,
                msg:'User is not allowed to change this User'
            });
        }
        //verificar contraseña vieja
         if (!(bcrypt.compareSync(passwords.OldPassword, userDB.password))) {
                return res.status(404).json({
                    ok:false,
                    msg:'Password doesen´t match'
                })
        }
        if(passwords.NewPassword !== passwords.RepeatNewPassword){
            return res.status(400).json({
                ok:false,
                msg:'The new passwords aren´t the same'
            });
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
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
module.exports = userCtrl;