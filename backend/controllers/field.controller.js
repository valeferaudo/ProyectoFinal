const Field = require ('../models/field.model');
const User = require ('../models/user.model');
const FieldPrice = require('../models/fieldPrice.model');
const SportCenter = require('../models/sportCenter.model');
const Appointments = require ('../models/appointment.model');
const { request, response} = require ('express');
const fieldCtrl = {};

const uploadCtrl = require('../controllers/uploadFile.controller')

fieldCtrl.getField = async (req = request , res = response) => {
    const id = req.params.id
    try {
        const fieldDB = await Field.findById(id);
        if(!fieldDB){
            return unknownIDResponse(res);
        }
        //OBTNER ULTIMO PRECIO
        let price = await FieldPrice.findOne({field:id}).sort({'sinceDate' : -1}).limit(1);
        price = price.price;
        //DEPORTES ASOCIADOS CON CANT MAX DE PLAYER, DÍAS Y HORARIOS
        res.json({
            ok:true,
            msg:'Found Field',
            param:{
                field: fieldDB,
                price
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
    //FALTAn FILTRos
    uid = req.uid
    searchText = req.query.text;
    state = req.query.state === undefined ? '' : req.query.state;
    sportCenterID = req.query.sportCenterID;
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
        searchText !== '' ? query['$and'].push({ name: new RegExp(searchText, 'i')}) : query ;
        if (state !== ''){
            booleanState === false ? query['$and'].push({deletedDate: {$ne: null}}) : query['$and'].push({deletedDate: null})
        }
        sportCenterID !== '' ? query['$and'].push({sportCenter: sportCenterID}) : query;
        query['$and'].length > 0 ? fields = await Field.find(query).populate('sportCenter') : fields = await Field.find().populate('sportCenter features sports.sport'); 
        //Armo el selected filters
        if(searchText !== ''){
            selectedFilters.push(' Texto: ', searchText)
        }
        if(state !== ''){
            selectedFilters.push(' Estado: ', state)
        }
        if(sportCenterID !== ''){
            if(fields.length > 0){
                selectedFilters.push(' Centro deportivo: ', fields[0].sportCenter.name)
            }
        }
        res.json({
            ok: true,
            msg:'Found sports',
            param: {
                fields,
                selectedFilters
            }
        })
        
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
fieldCtrl.createField = async (req = request , res = response) => {
    const name = req.body.name;
    const price = req.body.price;
    try {
        const field = new Field(req.body)
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
        let state;
        arrayChanges === [] ? state = false : state = true;
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
        let fields = await Field.find({sportCenter: sportCenterID,state:true});
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
fieldCtrl.getMinMaxPrices = async (req = request, res = response)=> {
    try {
        let fieldsPrices = await Field.find({ $and: [ {deletedDate: null }, { state:true } ] },'id price')
        let minPrice;
        let maxPrice;
        minPrice = getMin(fieldsPrices);
        maxPrice = getMax(fieldsPrices);
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

module.exports = fieldCtrl;