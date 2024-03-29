const Service = require ('../models/service.model');
const SportCenter = require ('../models/sportCenter.model');
const { request, response} = require ('express');
const serviceCtrl = {};


serviceCtrl.getService = async (req = request,res = response)=>{
}
serviceCtrl.getServices = async (req = request,res = response)=>{
    searchText = req.query.text;
    state = req.query.state;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        let services;
        let booleanState;
        let selectedFilters = [];
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }
        let query = {
            '$and': []
        };
        if(searchText !== ''){
            query['$and'].push({ name: new RegExp(searchText, 'i')});
            selectedFilters.push(`"${searchText}"`)
        }
        if(state !== ''){
            query['$and'].push({state:booleanState});
            selectedFilters.push(state);
        }
        if(query['$and'].length > 0){
            [services,total] = await Promise.all([Service.find(query).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                Service.find(query).countDocuments()
                                               ])
        }else{
            [services,total] = await Promise.all([Service.find().skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                Service.find().countDocuments()
                                               ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok: true,
            msg:'Found services',
            param: {
                services,
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
serviceCtrl.createService = async (req = request, res = response) =>{
    const {name} = req.body
    try {
        const existsName = await Service.findOne({name});
        if(existsName){
            return existsNameResponse(res);
        }
        service = new Service({
            name: req.body.name,
            description: req.body.description,
        });
        await service.save();
        res.json({
            ok:true,
            msg: 'Created Service',
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
serviceCtrl.updateService = async (req = request, res = response) =>{
    const serviceID = req.params.id
    const name = req.body.name
    try {
        const serviceDB = await Service.findById(serviceID);
        if(!serviceDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        //si no modifica el name (porque sino chocan por ser iguales)
        if(changes.name === serviceDB.name){
            delete changes.name
        }else{
            const nameExists = await Service.findOne({name});
            if(nameExists){
                return existsNameResponse(res);
            }
        }
        await Service.findByIdAndUpdate(serviceID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Service'
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
serviceCtrl.activateBlockService = async (req= request, res= response) => {
    const serviceID = req.params.id;
    const action= req.body.action;
    try {
        const serviceDB = await Service.findById(serviceID)
        if(!serviceDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(serviceDB.state === false){
                return serviceBlockedResponse(res);
            }
            else{
                serviceDB.state = false;
            }
        }
        else if (action === 'active'){
            if(serviceDB.state === true){
                return serviceActiveResponse(res);
            }
            else{
                serviceDB.state = true;
            }
        }
        await Service.findByIdAndUpdate(serviceID,serviceDB,{new:true});
        if (action === 'block'){
            //ELIMINAR DE LOS CENTROS
            await SportCenter.updateMany({}, {$pull:{services:{service:serviceDB.id}}})

            res.json({
                ok:true,
                msg:'Blocked Service'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Activated Service'
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
serviceCtrl.getCombo = async (req = request, res = response)=> {
    try {
        let services = await Service.find({state:  true},'id name');
        let combo = [];
        services.forEach(service => {
            let x = {id:service.id, text:service.name};
            combo.push(x);
        });
        res.json({
            ok: true,
            msg:'Found Service combo',
            param: {
                combo
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
function existsNameResponse(res){
    return res.status(400).json({
        ok:false,
        code: 10,
        msg:'A Service already exists with this name'
    })
}
function serviceBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This Service is blocked'
    })
}
function serviceActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Service is active'
    })
}
module.exports = serviceCtrl;
