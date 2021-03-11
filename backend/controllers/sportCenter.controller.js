const SportCenter = require ('../models/sportCenter.model');
const SportCenterService = require ('../models/sportCenterService.model');
const Service = require ('../models/service.model');
const User = require ('../models/user.model');
const UserRoleHistorial = require ('../models/userRoleHistorial.model');
const {request, response} = require('express');
const sportCenterCtrl ={};


sportCenterCtrl.getSportCenter = async (req = request,res = response)=>{
    sportCenterID = req.params.id;
    userID = req.uid;
    try {
        const sportCenter = await SportCenter.findById(sportCenterID)
        if (!sportCenter) {
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        const user = await User.findById(uid)
        if (user.sportCenter !== sportCenterID) {
            return res.status(403).json({
                ok:false,
                msg: 'This User role doesn´t have the permissions to this Sport Center'
            })
        }
        res.json({
            ok: true,
            msg:'Found Sport Center',
            param: sportCenter
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.getSportCenters = async (req = request,res = response)=>{
    //FALTAN FILTROS
    try {
        const sportCenters = await SportCenter.find()
        res.json({
            ok: true,
            msg:'Found Sport Centers',
            param: sportCenters
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

sportCenterCtrl.createSportCenter = async(req = request,res = response)=>{
    const userID = req.uid
    const userBody = req.body
    try {
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to create Sport Center'
            })
        }
        const sportCenterDB = await SportCenter.findOne({name: userBody.name});
        if (!sportCenterDB){
            return res.status(400).json({
                ok:false,
                msg:'A Sport Center already exists with this name'
            })
        }
        sportCenter = new SportCenter({
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            aditionalElectricityHour: req.body.aditionalElectricityHour,
            aditionalElectricity: req.body.aditionalElectricity,
            mercadoPago: req.body.mercadoPago
        });
        await sportCenter.save();
        const sportCenterCreated = await SportCenter.findOne({name: sportCenter.name});
        const userObject = {
            sportCenter: sportCenterCreated.id
        }
        userDB = await User.findByIdAndUpdate({userID},{$set: userObject});
        res.json({
            ok:true,
            msg: 'Created Sport Center',
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:"An unexpected error occurred"
        })
    }
}

sportCenterCtrl.updateSportCenter = async (req = request, res = response) =>{
    const userID = req.uid
    const sportCenterID = req.params.id;
    try {
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to update Sport Center'
            })
        }
        const userDB = await User.findById(userID);
        if(userDB.sportCenter !== sportCenterID){
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to update this Sport Center'
            })
        }
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        const changes = req.body;
        //si no modifica el name (porque sino chocan por ser iguales)
        if(changes.name === sportCenterDB.name){
            delete changes.name
        }else{
            const existsName = await SportCenter.findOne({name: changes.name});
            if(existsName){
                return res.status(400).json({
                    ok:false,
                    msg:'A Sport Center already exists with this name'
                })
            }
        }
        await SportCenter.findByIdAndUpdate(sportCenterID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Sport Center'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.deleteSportCenter = async (req = request, res = response) =>{
    const userID = req.uid;
    const sportCenterID = req.params.id;
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        if (userDB.sportCenter !== sportCenterID) {
            return res.status(403).json({
                ok:false,
                msg:'This User doesn´t have the permissions to delete this Sport Center'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to delete Sport Center'
            })
        }
        if(sportCenterDB.deletedDate !== null){
            return res.status(404).json({
                ok:false,
                msg:'This Sport Center is already blocked'
            })
        }
        sportCenterDB.deletedDate = Date.now();
        await SportCenter.findByIdAndUpdate(sportCenterID,sportCenterDB,{new:true})
        res.json({
            ok:true,
            msg:'Deleted Sport Center'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.addService = async (req = request, res = response) =>{
    const userID = req.uid;
    const sportCenterID = req.params.id;
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        if (userDB.sportCenter !== sportCenterID) {
            return res.status(403).json({
                ok:false,
                msg:'This User doesn´t have the permissions to add Sport Center Service'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to add Sport Center Service'
            })
        }
        sportCenterService = new SportCenterService({
            sportCenter: sportCenterID,
            service: req.body.service,
            price: req.body.price,
            observation: req.body.observation,
        })
        await sportCenterService.save();
        res.json({
            ok:true,
            msg:'Created Sport Center - Service'
        })
        
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                    ok:false,
                    msg:'The Field is already reserved for the requested date'
            })
        }
        console.log(error)
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.updateService = async (req = request, res = response) =>{
    const userID = req.uid;
    const sportCenterID = req.params.id;
    const serviceID = req.params.service;
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        const serviceDB = await Service.findById(serviceID);
        if(!serviceDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        if (userDB.sportCenter !== sportCenterID) {
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to update this Sport Center Service'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to update Sport Center Service'
            })
        }
        if(sportCenterDB.deletedDate !== null){
            return res.status(404).json({
                ok:false,
                msg:'This Sport Center is blocked'
            })
        }
        changes = {
            price : req.body.price,
            observation : req.body.observation
        }
        await SportCenterService.findOneAndUpdate({sportCenter:sportCenterID, service: serviceID},changes, {new:true});
        res.json({
            ok:true,
            msg:'Updated Sport Center Service'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.deleteService = async (req = request, res = response) =>{
    const userID = req.uid;
    const sportCenterID = req.params.id;
    const serviceID = req.params.service;
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Sport Center ID'
            })
        }
        const serviceDB = await Service.findById(serviceID);
        if(!serviceDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        if (userDB.sportCenter !== sportCenterID) {
            return res.status(404).json({
                ok:false,
                msg:'This User doesn´t have the permissions to delete this Sport Center Service'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to delete Sport Center Service'
            })
        }
        if(sportCenterDB.deletedDate !== null){
            return res.status(404).json({
                ok:false,
                msg:'This Sport Center is blocked'
            })
        }
        await SportCenter.findOneAndDelete({sportCenter:sportCenterID, service:serviceID})
        res.json({
            ok:true,
            msg:'Deleted Sport Center Service'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
module.exports = sportCenterCtrl;