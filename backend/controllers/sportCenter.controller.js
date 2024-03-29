const SportCenter = require ('../models/sportCenter.model');
const Service = require ('../models/service.model');
const User = require ('../models/user.model');
const Day = require ('../models/day.model')
const Sport = require ('../models/sport.model')
const Field = require ('../models/field.model')
const Cryptr = require('cryptr');
const {request, response} = require('express');
const sportCenterCtrl ={};
var moment = require('moment');
moment().format();

sportCenterCtrl.getSportCenter = async (req = request,res = response)=>{
    sportCenterID = req.params.id;
    try {
        let sportCenter = await SportCenter.findById(sportCenterID).populate('schedules').populate('services.service')
        if (!sportCenter) {
            return unknownIDResponse(res);
        }
        const cryptr = new Cryptr(process.env.CRYTPR);
        if(sportCenter.credentials.accessToken){
            sportCenter.credentials.accessToken = cryptr.decrypt(sportCenter.credentials.accessToken)
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
    searchText = req.query.text;
    state = req.query.state;
    days = req.query.day;
    sports = req.query.sport;
    services = req.query.service;
    sinceHour = req.query.sinceHour;
    untilHour = req.query.untilHour;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    available = req.query.available === 'true' ? true : false;
    try {
        let sportCenters;
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
        if (state !== ''){
            booleanState === false ? query['$and'].push({deletedDate: {$ne: null}}) : query['$and'].push({deletedDate: null});
            selectedFilters.push(state);
        }
        available === true ? query['$and'].push({deletedDate: null}) : query;
        if(services !== undefined){
            query['$and'].push({services: {$elemMatch: {service:{ $in: services}}}});
            const servicesName = await Service.find({_id:{ $in: services}},'name');
            servicesName.forEach(item => {
                selectedFilters.push(item.name)
            });
        }
        if(days !== undefined && sinceHour !== '0' && untilHour !== '23'){
            query['$and'].push({schedules:{$elemMatch: {day: days, $and:[{openingHour: {$lte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h')}},
                                                                        {closingHour: {$gte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}],
                                                       }}})
            const daysName = await Day.find({idDia:{ $in: days}},'name');
            selectedFilters.push(daysName[0].name)
        }
        else if (days !== undefined && sinceHour === '0' && untilHour === '23'){
            query['$and'].push({schedules:{$elemMatch: {day: days}}})
            const daysName = await Day.find({idDia:{ $in: days}},'name');
            selectedFilters.push(daysName[0].name)
        }
        else if (days === undefined){
            query['$and'].push({schedules: {$elemMatch: {$and:[{ openingHour: {$gte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h') }},
                                                                { closingHour: {$lte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}
                                                            ]}}})
        }
        if(parseInt(sinceHour) !== 0 || parseInt(untilHour) !== 23){
            selectedFilters.push(`${sinceHour}-${untilHour} hs`)
        }
        let sportCenterSport = [];
        let sportCenterSportID = [];
        if(sports !== undefined){
            sportCenterSport = await Field.find({sports: {$elemMatch: {sport:{ $in: sports}}}},'sportCenter sports').populate('sports.sport');
            sportCenterSport.forEach(item => {
                sportCenterSportID.push(item.sportCenter)
            });
            sportCenterSport !== [] ? query['$and'].push({_id: {$in: sportCenterSportID}}) : query;
            const sportsName = await Sport.find({_id:{ $in: sports}},'name');
            sportsName.forEach(item => {
                selectedFilters.push(item.name)
            });
        } 
        if(query['$and'].length > 0){
                [sportCenters,total] = await Promise.all([SportCenter.find(query).skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    SportCenter.find(query).countDocuments()
                                                ])
        }else{
                [sportCenters,total] = await Promise.all([SportCenter.find().skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    SportCenter.find().countDocuments()
                                                ])
        }
        total = Math.ceil(total / registerPerPage);
        res.json({
            ok: true,
            msg:'Found SportCenters',
            param: {
                sportCenters: sportCenters,
                selectedFilters: selectedFilters,
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
        const cryptr = new Cryptr(process.env.CRYTPR);
        sportCenter = new SportCenter({
            name: sportCenterBody.name,
            address: sportCenterBody.address,
            coords:{
                latitude: sportCenterBody.latitude,
                longitude: sportCenterBody.longitude
            },
            createdDate: new Date(),
            phone: sportCenterBody.phone,
            aditionalElectricityHour: sportCenterBody.aditionalElectricity ? sportCenterBody.aditionalElectricityHour : null,
            aditionalElectricity: sportCenterBody.aditionalElectricity,
            mercadoPago: sportCenterBody.mercadoPago,
            cancelationHour: sportCenterBody.cancelationHour,
            credentials:{
                accessToken: sportCenterBody.mercadoPago ? cryptr.encrypt(sportCenterBody.accessToken) : null,
                publicKey: sportCenterBody.mercadoPago ? sportCenterBody.publicKey : null,
            },
            paymentRequired: sportCenterBody.paymentRequired === '' || sportCenterBody.paymentRequired === 'false' ? false : true,
            minimunAmount: sportCenterBody.minimunAmount,
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
            await Field.updateMany({sportCenter: sportCenterDB.id},{deletedDate: new Date()})
            fieldIDs = await Field.find({sportCenter: sportCenterDB.id},'id')
            let ids=[];
            fieldIDs.forEach(element => {
                ids.push((element._id).toString())
            });
            ids.push((sportCenterDB.id).toString());
            await User.updateMany({},{$pull:{favorites:{$in:ids}}})
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
        changes.coords = {
            latitude: req.body.latitude,
            longitude: req.body.longitude
        }
        changes.aditionalElectricityHour = req.body.aditionalElectricity ? req.body.aditionalElectricityHour : null;
        const cryptr = new Cryptr(process.env.CRYTPR);
        if(changes.accessToken !== null && changes.publicKey !== null){
            if(sportCenterDB.credentials.accessToken !== null){
                if(cryptr.decrypt(sportCenterDB.credentials.accessToken) !== req.body.accessToken){
                    changes.credentials = {
                        accessToken: req.body.mercadoPago ? cryptr.encrypt(req.body.accessToken) : null,
                        publicKey: req.body.mercadoPago ? req.body.publicKey : null,
                    }
                }
                else{
                    delete changes.accessToken
                }
            }else{
                changes.credentials = {
                    accessToken: req.body.mercadoPago ? cryptr.encrypt(req.body.accessToken) : null,
                    publicKey: req.body.mercadoPago ? req.body.publicKey : null,
                }
            }
            if(sportCenterDB.credentials.publicKey !== null){
                if(sportCenterDB.credentials.publicKey !== req.body.publicKey){
                    changes.credentials = {
                        accessToken: req.body.mercadoPago ? cryptr.encrypt(req.body.accessToken) : null,
                        publicKey: req.body.mercadoPago ? req.body.publicKey : null,
                    }
                }
                else{
                    delete changes.publicKey
                }
            }
        }
        sportCenter = await SportCenter.findByIdAndUpdate(sportCenterID,changes,{new:true})
        if(sportCenter.credentials.accessToken !== null){
            sportCenter.credentials.accessToken = cryptr.decrypt(sportCenter.credentials.accessToken)
        }
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
        if(changes.length !== 0){
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
        }
        sportCenter = await SportCenter.findByIdAndUpdate(sportCenterID,{$set:{schedules:arrayChanges}},{new:true})
        if(arrayChanges.length === 0){
            await Field.updateMany({sportCenter: sportCenterDB.id},{state:false})
        }else{
            await Field.updateMany({$and:[{sportCenter: sportCenterDB.id},{sports:{$ne:[]}}]},{state:true})
        }
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
sportCenterCtrl.getCombo = async (req = request, res = response)=> {
    try {
        let sportCenters = await SportCenter.find({$and:[{deletedDate: null},{schedules:{$ne:[]}}]},'name coords');
        let combo = [];
        sportCenters.forEach(sportCenter => {
            let x = {id:sportCenter.id, text:sportCenter.name, coords: sportCenter.coords};
            combo.push(x);
        });
        res.json({
            ok: true,
            msg:'Found SportCenter combo',
            param: {
                combo
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
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