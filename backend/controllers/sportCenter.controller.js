const SportCenter = require ('../models/sportCenter.model');
const Service = require ('../models/service.model');
const User = require ('../models/user.model');
const Day = require ('../models/day.model')
const Field = require ('../models/field.model')
const {request, response} = require('express');
const sportCenterCtrl ={};
var moment = require('moment');
moment().format();

sportCenterCtrl.getSportCenter = async (req = request,res = response)=>{
    sportCenterID = req.params.id;
    try {
        const sportCenter = await SportCenter.findById(sportCenterID).populate('schedules')
        if (!sportCenter) {
            return unknownIDResponse(res);
        }
        // const fields = await Field.find({sportCenter:sportCenterID})
        //faltan obtener deportes, caracterisitcas y servicios para mostrar.
        res.json({
            ok: true,
            msg:'Found SportCenter',
            param: {sportCenter: sportCenter}
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCenterCtrl.getSportCenters = async (req = request,res = response)=>{
    //FALTAN FILTROS
    searchText = req.query.text;
    state = req.query.state;
    days = req.query.day;
    sports = req.query.sport;
    services = req.query.service;
    sinceHour = req.query.sinceHour;
    untilHour = req.query.untilHour;
    try {
        let sportCenters;
        let booleanState;
        let selectedFilters;
        if(state === 'Activo'){
            booleanState = true;
        }
        else if(state === 'Bloqueado'){
            booleanState = false;
        }
        let query = {
            '$and': []
        };
        searchText !== '' ? query['$and'].push({ name: new RegExp(searchText, 'i')}) : query ;
        if (state !== ''){
            booleanState === false ? query['$and'].push({deletedDate: {$ne: null}}) : query['$and'].push({deletedDate: null})
        }
        services !== undefined ? query['$and'].push({services: {$elemMatch: {service:{ $in: services}}}}) : query ;
        // days !== undefined ? query['$and'].push({schedules: {$elemMatch: {day:{ $in: days}}}}) : query ;
        if(days !== undefined){
            query['$and'].push({$and: [ {schedules: {$elemMatch: {day:{ $in: days}}}},
                                        {schedules: {$elemMatch:{ openingHour: {$gte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h') }}}},
                                        {schedules: {$elemMatch:{ closingHour: {$lte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}}}]})

        }
        else{
            query['$and'].push({$and: [ {schedules: {$elemMatch:{ openingHour: {$gte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h') }}}},
                                        {schedules: {$elemMatch:{ closingHour: {$lte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}}}]})
        }
        let sportCenterSport = [];
        let sportCenterSportID = [];
        if(sports !== undefined){
            sportCenterSport = await Field.find({sports: {$elemMatch: {sport:{ $in: sports}}}},'sportCenter');
            sportCenterSport.forEach(item => {
                sportCenterSportID.push(item.sportCenter)
            });
            sportCenterSport !== [] ? query['$and'].push({_id: {$in: sportCenterSportID}}) : query 
        } 
        query['$and'].length > 0 ? sportCenters = await SportCenter.find(query) : sportCenters = await SportCenter.find(); 

        if(searchText === '' && state === '' ){
            selectedFilters = [];
        }
        else if(searchText !== '' && state === ''){
            selectedFilters = ['Texto: ', searchText];
        }
        else if(searchText === '' && state !== ''){
            selectedFilters = ['Estado: ',state];
        }
        else if(text !== '' && state !== ''){
            selectedFilters = ['Texto: ', searchText,' - ','Estado: ',state];
        }
        res.json({
            ok: true,
            msg:'Found SportCenters',
            param: {
                sportCenters: sportCenters,
                selectedFilters: selectedFilters
            }
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCenterCtrl.createSportCenter = async(req = request,res = response)=>{
    const userID = req.uid
    const sportCenterBody = req.body
    try {
        const userDB = await User.findById(userID);
        if(!userDB){
            if (!user) {
                return res.status(404).json({
                    ok:false,
                    msg:'Unknown ID. Please insert a correct User ID'
                })
            }
        }
        if(userDB.role !== 'CENTER-SUPER-ADMIN'){
            return res.status(403).json({
                ok:false,
                msg:'This User role doesn´t have the permissions to create Sport Center'
            })
        }
        const sportCenterDB = await SportCenter.findOne({name: sportCenterBody.name});
        if (sportCenterDB){
            return res.status(400).json({
                ok:false,
                msg:'A Sport Center already exists with this name'
            })
        }
        const days = await Day.find();
        let daysID = [];
        days.forEach(day => {
            daysID.push(day.idDia)
        });
        sportCenter = new SportCenter({
            name: sportCenterBody.name,
            address: sportCenterBody.address,
            phone: sportCenterBody.phone,
            aditionalElectricityHour: sportCenterBody.aditionalElectricityHour,
            aditionalElectricity: sportCenterBody.aditionalElectricity,
            mercadoPago: sportCenterBody.mercadoPago,
            schedules:[]
        });
        await sportCenter.save();
        const sportCenterCreated = await SportCenter.findOne({name: sportCenter.name});
        // const userObject = {
        //     sportCenter: ObjectId(`${sportCenterCreated._id}`)
        // }
        await User.findByIdAndUpdate(userID,{$set: {sportCenter:sportCenterCreated.id}});
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
sportCenterCtrl.activateBlockSportCenter = async (req = request, res = response) =>{
    const sportCenterID = req.params.id;
    const action= req.body.action;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID)
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(sportCenterDB.deletedDate !== null){
                return sportCenterBlockedResponse(res);
            }
            else{
                sportCenterDB.deletedDate = new Date();
                //ACA FALTA DAR DE BAJA TODO LO REFERIDO A ESTE CENTRO DEPORTIVO
            }
        }
        else if (action === 'active'){
            if(sportCenterDB.deletedDate === null){
                return sportCenterActiveResponse(res);
            }
            else{
                sportCenterDB.deletedDate = null;
            }
        }
        await SportCenter.findByIdAndUpdate(sportCenterID,sportCenterDB,{new:true});
        if (action === 'block'){
            res.json({
                ok:true,
                msg:'Blocked SportCenter'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Activated SportCenter'
            })
        }
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
sportCenterCtrl.updateSportCenter = async (req = request, res = response) =>{
    const sportCenterID = req.params.id;
    try {
        const sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        //si no modifica el name (porque sino chocan por ser iguales)
        if(changes.name === sportCenterDB.name){
            delete changes.name
        }else{
            const existsName = await SportCenter.findOne({name: changes.name});
            if(existsName){
                return existsNameResponse(res);
            }
        }
        sportCenter = await SportCenter.findByIdAndUpdate(sportCenterID,changes,{new:true})
        res.json({
            ok:true,
            msg:'Updated Sport Center',
            param: { sportCenter }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.updateSchedule = async (req = request, res = response) =>{
    const sportCenterID = req.params.id;
    try {
        let sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        const changes = req.body;
        let arrayChanges = []
        changes.schedules.forEach(item => {
            let dayID;
            switch (item.day) {
                case 'Lunes':
                    dayID = 1;
                    break;
                case 'Martes':
                    dayID = 2;  
                    break;
                case 'Miércoles':
                    dayID = 3;
                    break;
                case 'Jueves':
                    dayID = 4;
                    break;
                case 'Viernes':
                    dayID = 5;
                    break;
                case 'Sábado':
                    dayID = 6;
                    break;
                case 'Domingo':
                    dayID = 7;
                    break;
            }
            const obj = {
                day: dayID,
                openingHour: setDate(item.openingHour),
                closingHour: setDate(item.closingHour)
            }
            arrayChanges.push(obj)
        });
        sportCenter = await SportCenter.findByIdAndUpdate(sportCenterID,{$set:{schedules:arrayChanges}},{new:true})
        res.json({
            ok:true,
            msg:'Updated Sport Center Schedules',
            param: { sportCenter }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
sportCenterCtrl.updateService = async (req = request, res = response) =>{
    const sportCenterID = req.params.id;
    try {
        let sportCenterDB = await SportCenter.findById(sportCenterID);
        if(!sportCenterDB){
            return unknownIDResponse(res);
        }
        const changes = req.body.service;
        let arrayChanges = [];
        changes.forEach(sf => {
            const obj = {
                service: sf.service,
                description: sf.description,
            }
            arrayChanges.push(obj)
        });
        sportCenter = await SportCenter.findByIdAndUpdate(sportCenterID,{$set:{services:arrayChanges}},{new:true})
        res.json({
            ok:true,
            msg:'Updated Sport Center Services',
            param: { sportCenter }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
//ESTO NO SE SI SE USA TODO
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
function sportCenterBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This SportCenter is blocked'
    })
}
function sportCenterActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This SportCenter is active'
    })
}
function existsNameResponse(res){
    return res.status(400).json({
        ok:false,
        code: 4,
        msg:'A SportCenter already exists with this name'
    })
}
function setDate(hour){
    if(hour === ''){
        return null
    }
    else{
        const date = new Date(`1970/01/01 ${hour}:00`) 
        return new Date(date.getTime() - process.env.UTC_ARG)
    }
}
module.exports = sportCenterCtrl;