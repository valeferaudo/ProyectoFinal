const User = require ('../models/user.model');
const Field = require ('../models/field.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response} = require ('express');
const userCtrl = {};
const bycript = require('bcryptjs');
const UserRoleHistorial = require ('../models/userRoleHistorial.model');
const { sendNewUserEmail } = require ('../helpers/emails/newUserEmail');
const { sendAcceptUser } = require ('../helpers/emails/acceptUserEmail');


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
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.getUsers = async (req = request,res = response)=>{
    active = parseInt(req.query.active);
    blocked = parseInt(req.query.blocked);
    try {
        var users;
        if(active === 1 && blocked === 0){
            users = await User.find({deletedDate: null})

        }
        else if(active === 0 && blocked === 1){
            users = await User.find({deletedDate: {$ne:null}})
        }
        else if(active === 1 && blocked === 1){
            users = await User.find()

        }
        res.json({
            ok: true,
            msg:'Found users',
            param: users
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
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
            secondName: req.body.secondName,
            phone: req.body.phone,
            address: req.body.address,
            email: req.body.email,
            password: req.body.password,
            state: initialState,
        });

        const salt = bycript.genSaltSync();
        user.password = bycript.hashSync(password,salt);
        await user.save();
        userDB = await User.findOne({email:user.email});
        const userRoleHistorial = new UserRoleHistorial({
            user: userDB.id,
            sinceDate: Date.now(),
            role: role
        })
        await userRoleHistorial.save();
        if(role === 'CENTER-SUPER-ADMIN'){
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
        if(changes.password === null){
            delete changes.password
        }else{
            const salt = bycript.genSaltSync();
            changes.password = bycript.hashSync(changes.password,salt);
        }
        if(changes.role !== 'CENTER-SUPER-ADMIN' && changes.role !== 'CENTER-ADMIN'){
            return res.status(400).json({
                ok:false,
                msg:'User role is wrong'
            });
        }
        await User.findByIdAndUpdate(uid,changes,{new:true})
        userRoleHistorial = await UserRoleHistorial.findOne({user:userDB.id}).sort({'sinceDate' : -1}).limit(1);
        if(userRoleHistorial.role === 'USER' || userRoleHistorial.role === 'SUPER-ADMIN'){
            return res.status(400).json({
                ok:false,
                msg:'User role is not allowed to change his role'
            });
        }
        if(changes.role !== userRoleHistorial.role){
            const userRoleHistorial = new UserRoleHistorial({
                user: userDB.id,
                sinceDate: Date.now(),
                role: req.body.role
            })
            await userRoleHistorial.save();
        }
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

userCtrl.activateSuperCenterAdmin = async (req = request, res = response) =>{
    const superAdminID = req.uid;
    const uid = req.params.id;
    try {
        const adminDBRole = await UserRoleHistorial.findOne({user:superAdminID}).sort({'sinceDate' : -1}).limit(1);
        if(adminDBRole.role !== 'SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:uid}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(404).json({
                ok:false,
                msg:'This User role doesn´t have to be accepted'
            })
        }
        const userDB = await User.findById(uid);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        if(userDB.deletedDate !== null){
            return res.status(403).json({
                ok:false,
                msg:'This User is deleted'
            })
        }
        userDB.state = true;
        await User.findByIdAndUpdate(uid,userDB,{new:true});
        sendAcceptUser(userDB)
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
userCtrl.favoriteUser = async (req = request, res = response) =>{
    const userID = req.uid;
    const newFavorite = req.params.id;
    try {
        const adminDBRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(adminDBRole.role !== 'USER'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to add favorites'
            })
        }
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
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
module.exports = userCtrl;