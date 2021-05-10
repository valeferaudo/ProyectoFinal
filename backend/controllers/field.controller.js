const Field = require ('../models/field.model');
const User = require ('../models/user.model');
const FieldPrice = require('../models/fieldPrice.model');
const FieldSport = require('../models/fieldSport.model');
const SportCenter = require('../models/sportCenter.model');
const Appointments = require ('../models/appointment.model');
const { request, response} = require ('express');
const fieldCtrl = {};

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
    state = req.query.state;
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
        fields = await Field.find(query);
        //Armo el selected filters
        if(searchText !== ''){
            selectedFilters.push(' Texto: ', searchText)
        }
        if(state !== ''){
            selectedFilters.push(' Estado: ', state)
        }
        if(sportCenterID !== ''){
            const userDB = await User.findById(uid)
            if(userDB.sportCenter.toString() !== sportCenterID){
                const sportCenterDB = await SportCenter.findById(sportCenterID, 'name')
                selectedFilters.push(' Centro deportivo: ', sportCenterDB.name)
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
        //valida que el nombre no exista, pero en igual igual en cuanto a mayus y minus
        const existsName = await Field.findOne({name});
        if(existsName){
            return existsNameResponse(res);
        }

        const field = new Field(req.body)
        let fieldDB = await field.save();
        const fieldPrice = new FieldPrice({field: fieldDB.id, sinceDate: new Date(), price: price})
        let fieldPriceDB = await fieldPrice.save();
        res.json({
            ok:true,
            msg:'Created Field',
            param: {
                field: fieldDB,
                price: fieldPriceDB
            }
        })
    } catch (error) {
        console.log(error);
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
        }else{
            const existsName = await Field.findOne({name});
            if(existsName){
                return existsNameResponse(res)
            }
        }
        await Field.findByIdAndUpdate(id,changes,{new:true});
        let price = await FieldPrice.findOne({field:id}).sort({'sinceDate' : -1}).limit(1);
        if (price.price !== changes.price){
            const fieldPrice = new FieldPrice({field: fieldDB.id, sinceDate: new Date(), price: changes.price})
            await fieldPrice.save();
        }
        res.json({
            ok:true,
            msg:'Updated Field'
        })
    } catch (error) {
        console.log(error);
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
//No se si se usan
fieldCtrl.getFieldsByCenterAdmin = async (req = request , res = response) => {
    const id = req.params.id
    const text = req.query.search
    const regex = new RegExp(text,'i');
    try {
        const fields = await Field.find({$and:[{name: regex},{user:id}]});
        res.json({
            ok:true,
            msg:'Found Fields',
            fields
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error occurred'
        })
    }
}
fieldCtrl.deleteField = async ( req = request, res = response) => {
    const id = req.params.id
    try {
        const fieldDB = await Field.findById(id);
        if (!fieldDB) {
            return res.status(404).json({
                ok:false,
                msg:'Unknown ID. Please insert a correct Field ID'
            })
        }
        const appointments = await Appointments.find({field: id})
        console.log("turnos" ,appointments)
        if(appointments.length>0){
            return res.status(404).json({
                ok:false,
                msg:'Cannot delete a Field with pending appointments'
            })
        }
        else{
            await Field.findByIdAndDelete(id)
            res.json({
                ok:true,
                msg:'Deleted Field'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'An unexpected error ocurred'
        })
    }
}

function setDate(hour){
    const date = new Date(`1970/01/01 ${hour}:00`) 
    return new Date(date.getTime() - process.env.UTC_ARG)
}
module.exports = fieldCtrl;