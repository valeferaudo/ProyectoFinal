const Field = require ('../models/field.model');
const User = require ('../models/user.model');
const FieldPrice = require('../models/fieldPrice.model');
const SportCenter = require('../models/sportCenter.model');
const Feature = require ('../models/feature.model');
const Sport = require ('../models/sport.model');
const Day = require ('../models/day.model');
const { request, response} = require ('express');
const fieldCtrl = {};
var moment = require('moment');
moment().format();

const uploadCtrl = require('../controllers/uploadFile.controller')

fieldCtrl.getField = async (req = request , res = response) => {
    const id = req.params.id
    try {
        const fieldDB = await Field.findById(id).populate('sportCenter').populate('sports.sport').populate('features');
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        res.json({
            ok:true,
            msg:'Found Field',
            param:{
                field: fieldDB,
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
fieldCtrl.getFields = async (req = request , res = response) => {
    uid = req.uid
    searchText = req.query.text;
    state = req.query.state === undefined ? '' : req.query.state;
    sportCenterID = req.query.sportCenterID === 'undefined' ? '' : req.query.sportCenterID; 
    sinceHour = req.query.sinceHour;
    untilHour = req.query.untilHour;
    sincePrice = req.query.sincePrice;
    untilPrice = req.query.untilPrice;
    features = req.query.feature;
    sports = req.query.sport;
    days = req.query.day;
    available = req.query.available === 'true' ? true : false;
    page = parseInt(req.query.page);
    registerPerPage = parseInt(req.query.registerPerPage);
    try {
        let fields;
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
        available === true ? query['$and'].push({$and:[{ state: true },{deletedDate: null}]}) : query;
        if(searchText !== ''){
            const sportCenters = await SportCenter.find({ name: new RegExp(searchText, 'i')},'_id')
            if(sportCenters.length > 0){
                let sportCentersID = [];
                sportCenters.forEach(item => {
                    sportCentersID.push(item._id)
                });
                query['$and'].push({ $or: [ { sportCenter:{$in: sportCentersID} }, { name: new RegExp(searchText, 'i') } ] });
            }
            else{
                query['$and'].push({ name: new RegExp(searchText, 'i')});
            }
            selectedFilters.push(`"${searchText}"`)
        }
        if (state !== ''){
            booleanState === false ? query['$and'].push({deletedDate: {$ne: null}}) : query['$and'].push({deletedDate: null});
            selectedFilters.push(state);
        }
        sportCenterID !== '' ? query['$and'].push({sportCenter: sportCenterID}) : query;
        if(features !== undefined){
            if (typeof(features) === 'object'){
                query['$and'].push({features:  {$in: features}})
            }
            else if (typeof(features) === 'string'){
                query['$and'].push({features: features})
            }
            const featuresName = await Feature.find({_id:{ $in: features}},'name');
            featuresName.forEach(item => {
                selectedFilters.push(item.name)
            });
        }
        if(sincePrice !== 'undefined' && untilPrice !== 'undefined'){
            query['$and'].push({$and: [ {price: {$gte: sincePrice}},
                {price: {$lte: untilPrice}}]});
            let fieldsPrices = await Field.find({ $and: [ {deletedDate: null }, { state:true } ] },'id price')
            fieldsPrices.length !== 0 ? minPrice = getMin(fieldsPrices) : minPrice =  0;
            fieldsPrices.length !== 0 ? maxPrice = getMax(fieldsPrices) : maxPrice = 0;
            if(minPrice !== parseInt(sincePrice) || maxPrice !== parseInt(untilPrice)){
            selectedFilters.push(`${sincePrice}-${untilPrice}$`)
            }
        }
        if(sports !== undefined){
            query['$and'].push({sports: {$elemMatch: {sport:{ $in: sports}}}});
            const sportsName = await Sport.find({_id:{ $in: sports}},'name');
            sportsName.forEach(item => {
                selectedFilters.push(item.name)
            });
        } 
        let sportCentersDay = [];
        if(days !== undefined && sinceHour !== '0' && untilHour !== '23'){
            sportCentersDay = await SportCenter.find({schedules:{$elemMatch: {day: days, $and:[{openingHour: {$lte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h')}},
                                                                                                {closingHour: {$gte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}],
                                                                            }}},'_id')
            const daysName = await Day.find({idDia:{ $in: days}},'name');
            daysName.forEach(item => {
                selectedFilters.push(item.name)
            });
        }
        else if (days !== undefined && sinceHour === '0' && untilHour === '23'){
            sportCentersDay = await SportCenter.find({schedules:{$elemMatch: {day: days}}},'_id')
            const daysName = await Day.find({idDia:{ $in: days}},'name');
            daysName.forEach(item => {
                selectedFilters.push(item.name)
            });
        }
        else if (days === undefined && !available){
            sportCentersDay = await SportCenter.find({schedules: {$elemMatch: {$and:[{ openingHour: {$gte: moment("1970-01-01").add(parseInt(sinceHour),'h').subtract(3,'h') }},
                                                                                        { closingHour: {$lte: moment("1970-01-01").add(parseInt(untilHour),'h').subtract(3,'h') }}
                                                                                    ]}}},'_id')
        }
        let sportCentersDayID = [];
        if(sportCentersDay.length > 0){
            sportCentersDay.forEach(item => {
                sportCentersDayID.push(item._id)
            });
            query['$and'].push({ sportCenter:{$in: sportCentersDayID}})
        }
        if(sinceHour !== 'undefined' && untilHour !== 'undefined'){
            if(parseInt(sinceHour) !== 0 || parseInt(untilHour) !== 23){
                selectedFilters.push(`${sinceHour}-${untilHour} hs`)
            }
        }
        if(query['$and'].length > 0){
             [fields,total] = await Promise.all([Field.find(query).populate('sportCenter features sports.sport').skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    Field.find(query).populate('sportCenter features sports.sport').countDocuments()
                                                ])
        }else{
             [fields,total] = await Promise.all([Field.find().populate('sportCenter features sports.sport').skip(registerPerPage*(page -1)).limit(registerPerPage),
                                                    Field.find().populate('sportCenter features sports.sport').countDocuments()
                                                ])
        }
        total = Math.ceil(total / registerPerPage);
        if(days !== undefined && sportCentersDay.length === 0 && available === true){
            fields = [];
            total = 0;
        }
        res.json({
            ok: true,
            msg:'Found sports',
            param: {
                fields,
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
fieldCtrl.createField = async (req = request , res = response) => {
    const price = req.body.price;
    try {
        let field = new Field(req.body);
        const sportCenterDB = await SportCenter.findById(req.body.sportCenter);
        if(sportCenterDB.deletedDate !== null){
            field.deletedDate = new Date();
        }
        let fieldDB = await field.save();
        const fieldPrice = new FieldPrice({field: fieldDB.id, sinceDate: new Date(), price: price})
        await fieldPrice.save();
        res.json({
            ok:true,
            msg:'Created Field',
            param: {
                field: fieldDB,
            }
        })
    } catch (error) {
        console.log(error);
        if (error.name === 'MongoError' && error.code === 11000) {
           return existsNameResponse(res);
        }
        errorResponse(res);
    }
}
fieldCtrl.updateField = async (req = request , res = response) => {
    const id = req.params.id;
    const name = req.body.name;
    try {
        const fieldDB = await Field.findById(id);
        if (!fieldDB) {
            return unknownIDResponse(res)
        };
        const changes = req.body;
        if(changes.name === fieldDB.name){
            delete changes.name
        }
        await Field.findByIdAndUpdate(id,changes,{new:true});
        let price = await FieldPrice.findOne({field:id}).sort({'sinceDate' : -1}).limit(1);
        if (price.price !== changes.price){
            const fieldPrice = new FieldPrice({field: fieldDB.id, sinceDate: new Date(), price: changes.price})
            await fieldPrice.save();
        }
        res.json({
            ok:true,
            msg:'Updated Field',
            param:{
                field: fieldDB
            }
        })
    } catch (error) {
        console.log(error);
        if (error.name === 'MongoError' && error.code === 11000) {
           return existsNameResponse(res);
        }
        errorResponse(res);
    }
}
fieldCtrl.updateFieldSport = async (req = request , res = response) => {
    const fieldID = req.params.id;
    const sportFields = req.body.sportFields;
    try {
        const fieldDB = await Field.findById(fieldID);
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        let arrayChanges = [];
        sportFields.forEach(sf => {
            const obj = {
                sport: sf.sport,
                cantPlayers: sf.cantPlayers,
            }
            arrayChanges.push(obj)
        });
        const sportCenterDB = await SportCenter.findById(fieldDB.sportCenter);
        let state;
        if(arrayChanges.length === 0 || sportCenterDB.schedules.length === 0){
            state = false;
        }else if (arrayChanges.length !== 0 && sportCenterDB.schedules.length !== 0){
            state = true;
        }
        
        const field = await Field.findByIdAndUpdate(fieldID, {$set:{sports:arrayChanges, state: state}},{new:true})
        res.json({
            ok:true,
            msg:'Update Field Sport',
            param: {
                field: field
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }   
}
fieldCtrl.getCombo = async (req = request, res = response)=> {
    sportCenterID = req.query.sportCenterID
    try {
        let fields = await Field.find({sportCenter: sportCenterID,state:true, deletedDate: null });
        let combo = [];
        fields.forEach(field => {
            let x = {id:field.id, text:field.name};
            combo.push(x);
        });
        res.json({
            ok: true,
            msg:'Found field combo',
            param: {
                combo
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
fieldCtrl.checkRoofed = async (req = request, res = response)=> {
    fieldID = req.params.id
    try {
        let fieldDB = await Field.findById(fieldID,('features'));
        let roofedFeatures = await Feature.find({$or:[{ name: new RegExp('techado', 'i')},
                                                        { name: new RegExp('techada', 'i')},
                                                        { name: new RegExp('Techado', 'i')},
                                                        { name: new RegExp('Techada', 'i')},
                                                        { name: new RegExp('TECHADO', 'i')},
                                                        { name: new RegExp('TECHADA', 'i')}]},'_id')
        let roofed = false;
        roofedFeatures.forEach(item => {
            if(fieldDB.features.includes(item._id)){
                roofed = true;
            }
        });
        res.json({
            ok: true,
            msg:'Found field combo',
            param: {
                roofed: roofed
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
fieldCtrl.getMinMaxPrices = async (req = request, res = response)=> {
    try {
        let fieldsPrices = await Field.find({ $and: [ {deletedDate: null }, { state:true } ] },'id price');
        let minPrice;
        let maxPrice;
        fieldsPrices.length !== 0 ? minPrice = getMin(fieldsPrices) : minPrice =  0;
        fieldsPrices.length !== 0 ? maxPrice = getMax(fieldsPrices) : maxPrice = 0;
        res.json({
            ok: true,
            msg:'Found Min-Max Prices',
            param: {
                minPrice,
                maxPrice
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
fieldCtrl.getPriceHistorial = async (req = request, res = response) => {
    const fieldID = req.params.id;
    try {
        let fieldPrices = await FieldPrice.find({field: fieldID})
        fieldPrices.sort((elem1,elem2)=>{
            return (moment(elem2.sinceDate).diff(moment(elem1.sinceDate)))
        })
        res.json({
            ok: true,
            msg:'Found Prices historial',
            param: {
                priceHistorial : fieldPrices
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
function getMin(fieldPrices){
    let prices = [];
    fieldPrices.forEach(field => {
       prices.push(field.price) 
    });
    return Math.min(...prices)
}
function getMax(fieldPrices){
    let prices = [];
    fieldPrices.forEach(field => {
       prices.push(field.price) 
    });
    return Math.max(...prices)
}
fieldCtrl.activateBlockField = async (req = request, res = response) =>{
    const fieldID = req.params.id;
    const action= req.body.action;
    try {
        const fieldDB = await Field.findById(fieldID)
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        if (action === 'block'){
            if(fieldDB.deletedDate !== null){
                return fieldBlockedResponse(res);
            }
            else{
                fieldDB.deletedDate = new Date();
            }
        }
        else if (action === 'active'){
            const sportCenterDB = await SportCenter.findById(fieldDB.sportCenter)
            if(fieldDB.deletedDate === null){
                return fieldActiveResponse(res);
            }
            if(sportCenterDB.deletedDate !== null){
                return sportCenterBlockedResponse(res)
            }
            if(fieldDB.deletedDate !== null && sportCenterDB.deletedDate === null){
                fieldDB.deletedDate = null;
            }
        }
        await Field.findByIdAndUpdate(fieldID,fieldDB,{new:true});
        if (action === 'block'){
            await User.updateMany({},{$pull:{favorites:{$in:[fieldDB.id]}}})
            res.json({
                ok:true,
                msg:'Blocked Field'
            })
        }
        else if(action === 'active'){
            res.json({
                ok:true,
                msg:'Activated Field'
            })
        }
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
        msg:'A Field already exists with this name'
    })
}
function fieldBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 6,
        msg:'This Field is blocked'
    })
}
function fieldActiveResponse(res){
    return res.status(404).json({
        ok:false,
        code: 7,
        msg:'This Field is active'
    })
}
function sportCenterBlockedResponse(res){
    return res.status(404).json({
        ok:false,
        code: 24,
        msg:'This Sport Center is blocked'
    })
}
module.exports = fieldCtrl;