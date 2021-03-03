const User = require ('../models/user.model');
const Service = require ('../models/service.model');
const SportCenterService = require ('../models/sportCenterService.model')
const { request, response} = require ('express');
const userCtrl = {};
const UserRoleHistorial = require ('../models/userRoleHistorial.model');
const { sendNewServiceEmail } = require ('../helpers/emails/newServiceEmail');
const { sendAcceptService } = require ('../helpers/emails/acceptServiceEmail');


userCtrl.getService = async (req = request,res = response)=>{
    userID = req.uid;
    serviceID = req.params.id;
    try {
        const userDB = await User.findById(userID)
        if (!userDB) {
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct User ID'
            })
        }
        // const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        // if (userRole.role !== 'CENTER-SUPER-ADMIN'){
        //     return res.status(403).json({
        //         ok:false,
        //         msg:'This User role doesn´t have the permissions to get Sport Center Service'
        //     })
        // }
        const serviceDB = await Service.findById(serviceID);
        if(!serviceDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        res.json({
            ok: true,
            msg:'Found Service',
            param: serviceDB
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.getServices = async (req = request,res = response)=>{
    try {
        const services = await Service.find();
        res.json({
            ok: true,
            msg:'Found Services',
            param: services
        })
        
    } catch (error) {
        console.log(error);
        res.stat(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

userCtrl.createService = async (req = request, res = response) =>{
    const {name} = req.body
    userID = req.uid
    try {
        const existsName = await Service.findOne({name});
        if(existsName){
            return res.status(400).json({
                ok:false,
                msg:'A Service already exists with this name'
            })
        }
        const userRole = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if (userRole.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to create Sport Center Service'
            })
        }
        service = new Service({
            name: req.body.name,
            description: req.body.description,
        });
        await service.save();
        sendNewServiceEmail(service);
        res.json({
            ok:true,
            msg: 'Created Service',
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}

userCtrl.updateService = async (req = request, res = response) =>{
    const userID = req.uid;
    const serviceID = req.params.id
    const name = req.body.name
    try {
        const serviceDB = await Service.findById(serviceID);
        if(!serviceDB){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        const userRoleHistorial = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRoleHistorial.role !== 'SUPER-ADMIN'){
            return res.status(400).json({
                ok:false,
                msg:'User role is not allowed to update Service'
            });
        }
        const changes = req.body;
        if(changes.name === serviceDB.name){
            delete changes.email
        }else{
            const existsName = await Service.findOne({name});
            if(existsName){
                return res.status(400).json({
                    ok:false,
                    msg:'A Service already exists with this name'
                })
            }
        }
        await Service.findByIdAndUpdate(serviceID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Service'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.deleteService = async (req = request, res = response) =>{
    const userID = req.uid;
    const serviceID = req.params.id
    try {
        const serviceBD = await Service.findById(serviceID);
        if(!serviceBD){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        const userRoleHistorial = await UserRoleHistorial.findOne({user:userID}).sort({'sinceDate' : -1}).limit(1);
        if(userRoleHistorial.role !== 'SUPER-ADMIN'){
            return res.status(400).json({
                ok:false,
                msg:'User role is not allowed to update Service'
            });
        }
        //ACA ELIMINAR TODASLAS RELACIONES ENTRE SERVICIO Y CENTRO DEPORTIVO
        await SportCenterService.remove({service:serviceID});
        await Service.findByIdAndDelete(serviceID)
        res.json({
            ok:true,
            msg:'Deleted Service'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
userCtrl.activateService = async (req = request, res = response) =>{
    const superAdminID = req.uid;
    const serviceID = req.params.id;
    try {
        const adminDBRole = await UserRoleHistorial.findOne({user:superAdminID}).sort({'sinceDate' : -1}).limit(1);
        if(adminDBRole.role !== 'SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions'
            })
        }
        serviceDB = await Service.findById(serviceID);
        if(!serviceBD){
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Service ID'
            })
        }
        if(userDB.state === true){
            return res.status(403).json({
                ok:false,
                msg:'This Service is already active'
            })
        }
        serviceBD.state = true;
        await Service.findByIdAndUpdate(serviceID,serviceDB,{new:true});
        sendAcceptService(serviceDB);
        res.json({
            ok:true,
            msg:'Activated Service'
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
